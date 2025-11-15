import json
import re
from pathlib import Path
from app.common.system_prompt import SYSTEM_PROMPT
from app.core.logger import create_logger
from app.services.llm_service import LocalLLMConnector
from app.services.schema_service import SchemaService
from app.services.database_service import db_session


class SQLAssistantService:

    logger = create_logger()

    def __init__(self):
        # Change: Qwen model for stronger tool-calling
        self.llm = LocalLLMConnector(model_name="qwen2.5-coder:14b", use_gpu=True)

        self.schema = None
        self.db = None

        tools_path = (
            Path(__file__).resolve().parent.parent
            / "common"
            / "tools"
            / "sql_tools.json"
        )
        with open(tools_path, "r", encoding="utf-8") as f:
            self.tools = json.load(f)

        self.logger.info("SQLAssistantService initialized")

    def _ensure_services(self):
        # Change: load global database session and validate connection
        if self.schema is None:
            self.schema = SchemaService()

        self.db = db_session

        if not self.db.is_connected():
            raise ValueError("No active database connection")

    def build_prompt(self, user_input: str, messages: list):
        # Change: Always include SYSTEM + TOOLS every turn for Qwen stability
        system = SYSTEM_PROMPT + "\nTOOLS:\n" + json.dumps(self.tools, indent=2) + "\n"

        prompt = system + f"USER:\n{user_input}\n"

        # Include conversation memory
        for m in messages:
            role = m["role"]
            content = m["content"]

            if role == "assistant":
                prompt += f"ASSISTANT:\n{content}\n"
            elif role == "tool":
                prompt += f"TOOL_RESPONSE:\n{content}\n"

        return prompt

    def execute_tool(self, name: str, args: dict):
        self._ensure_services()
        args = args or {}

        # Normalize schema and table names
        if "schema" in args and isinstance(args["schema"], str):
            args["schema"] = args["schema"].strip().lower()

        if "table" in args and isinstance(args["table"], str):
            args["table"] = args["table"].strip().lower()

        self.logger.info("Executing tool %s args=%s", name, args)

        dispatch = {
            "list_schemas": lambda: self.schema.get_schemas(),
            "list_tables": lambda: self.schema.get_table_names(args.get("schema")),
            "get_columns": lambda: self.schema.get_table_columns(
                args.get("table"), args.get("schema")
            ),
            "get_primary_keys": lambda: self.schema.get_primary_keys(
                args.get("schema"), args.get("table")
            ),
            "get_foreign_keys": lambda: self.schema.get_foreign_keys(
                args.get("schema"), args.get("table")
            ),
            "describe_table": lambda: self.schema.describe_table(
                args.get("schema"), args.get("table")
            ),
            "describe_schema": lambda: self.schema.get_schema_grouped(
                args.get("schema")
            ),
        }

        return dispatch.get(name, lambda: {"error": f"Unknown tool: {name}"})()

    def _extract_marker_block(self, text: str, marker: str) -> str | None:
        # Change: match with or without colon
        pattern = rf"{marker}\s*:? "
        match = re.search(pattern, text)
        if not match:
            return None
        return text[match.end() :].strip()

    def safe_json_parse(self, text: str):
        # Remove markdown wrappers
        text = text.replace("```json", "").replace("```", "").strip()

        # Remove invalid JSON comments
        text = re.sub(r"//.*", "", text)

        # Extract first balanced JSON using simple boundary detection
        start = text.find("{")
        end = text.rfind("}")

        if start == -1 or end == -1 or end <= start:
            return None

        json_str = text[start : end + 1].strip()

        # First attempt
        try:
            return json.loads(json_str)
        except:
            pass

        # Basic repair: remove trailing commas
        repaired = re.sub(r",\s*}", "}", json_str)
        repaired = re.sub(r",\s*]", "]", repaired)

        try:
            return json.loads(repaired)
        except:
            return None

    def run(self, user_input: str):

        self.logger.info("Agent started for: %s", user_input)
        self._ensure_services()

        messages = []
        max_steps = 10

        selected_schema = None
        selected_table = None

        schemas_list = None
        tables_list = None

        for step in range(max_steps):
            prompt = self.build_prompt(user_input, messages)
            raw_response = self.llm.run_text(prompt)

            response = self._clean_llm_output(raw_response)
            self.logger.debug("LLM cleaned response (step %d): %s", step, response)

            # -----------------------------------------------
            # 1. Explicit TOOL_CALL
            # -----------------------------------------------
            tool_block = self._extract_marker_block(response, "TOOL_CALL")
            if tool_block:
                tool_call = self.safe_json_parse(tool_block)
                if tool_call:
                    name = tool_call.get("name")
                    args = tool_call.get("arguments", {}) or {}

                    # Normalize schema/table
                    if "schema" in args and isinstance(args["schema"], str):
                        if args["schema"] not in [None, "<default_schema>"]:
                            args["schema"] = args["schema"].strip().lower()
                    if "table" in args and isinstance(args["table"], str):
                        args["table"] = args["table"].strip().lower()

                    # Auto-fix schema invented by LLM
                    if name != "list_schemas":
                        if args.get("schema") in [None, "<default_schema>"]:
                            if selected_schema:
                                args["schema"] = selected_schema

                    result = self.execute_tool(name, args)
                    messages.append({"role": "tool", "content": json.dumps(result)})

                    # Save schemas
                    if name == "list_schemas" and isinstance(result, list):
                        schemas_list = result
                        if len(result) == 1:
                            selected_schema = result[0]

                    # Save tables
                    if name == "list_tables" and isinstance(result, list):
                        tables_list = result

                    # Validate describe_table
                    if name == "describe_table" and args.get("table"):
                        if tables_list and args["table"].lower() not in [
                            t.lower() for t in tables_list
                        ]:
                            return {"error": f"Table '{args['table']}' does not exist"}
                        selected_table = args["table"]

                    continue

            # -----------------------------------------------
            # 2. Implicit TOOL_CALL
            # -----------------------------------------------
            implicit = self.safe_json_parse(response)
            if (
                implicit
                and isinstance(implicit, dict)
                and "name" in implicit
                and "arguments" in implicit
                and "sql" not in implicit
            ):
                name = implicit["name"]
                args = implicit.get("arguments", {}) or {}

                # Normalize schema/table
                if "schema" in args and isinstance(args["schema"], str):
                    if args["schema"] not in [None, "<default_schema>"]:
                        args["schema"] = args["schema"].strip().lower()
                if "table" in args and isinstance(args["table"], str):
                    args["table"] = args["table"].strip().lower()

                # Auto-fix schema invented by LLM
                if args.get("schema") in [None, "<default_schema>"]:
                    if selected_schema:
                        args["schema"] = selected_schema

                result = self.execute_tool(name, args)
                messages.append({"role": "tool", "content": json.dumps(result)})

                # Save schemas
                if name == "list_schemas" and isinstance(result, list):
                    schemas_list = result
                    if len(result) == 1:
                        selected_schema = result[0]

                # Save tables
                if name == "list_tables" and isinstance(result, list):
                    tables_list = result

                continue

            # -----------------------------------------------
            # 3. Explicit FINAL_SQL
            # -----------------------------------------------
            final_block = self._extract_marker_block(response, "FINAL_SQL")
            if final_block:
                final = self.safe_json_parse(final_block)
                if final:
                    return final
                return {"error": "Invalid FINAL_SQL JSON"}

            # -----------------------------------------------
            # 4. Implicit FINAL_SQL
            # -----------------------------------------------
            if implicit and "sql" in implicit:
                return implicit

            # -----------------------------------------------
            # 5. Continue assistant message
            # -----------------------------------------------
            messages.append({"role": "assistant", "content": response})

        return {"error": "max_steps_reached"}

    def _clean_llm_output(self, text: str) -> str:
        # Change: expanded ANSI cleanup
        text = re.sub(r"\x1b\[[0-9;]*[A-Za-z]", "", text)
        text = re.sub(r"[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]", "", text)
        text = re.sub(r"\[\?2004[hl]", "", text)
        text = text.replace("[2K", "")
        text = text.replace("```json", "").replace("```", "")
        return text.strip()
