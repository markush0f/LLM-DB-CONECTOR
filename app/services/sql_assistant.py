import json
import re
from pathlib import Path
from app.common.system_prompt import SYSTEM_PROMPT
from app.core.logger import create_logger
from app.services.llm_service import LocalLLMConnector
from app.services.schema_service import SchemaService
from app.services.internal_database_service import DatabaseService


class SQLAssistantService:

    logger = create_logger()

    def __init__(self):
        self.llm = LocalLLMConnector(model_name="llama3.1", use_gpu=True)
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
        if self.schema is None:
            self.schema = SchemaService()
        if self.db is None:
            self.db = DatabaseService()

    def build_prompt(self, user_input: str, messages: list):
        tool_block = json.dumps(self.tools, indent=2)
        system = SYSTEM_PROMPT + "\nTOOLS:\n" + tool_block

        history = ""
        for m in messages:
            history += f"{m['role'].upper()}: {m['content']}\n"

        full_prompt = f"{system}\nUSER: {user_input}\n{history}"

        self.logger.debug("Prompt built (%d chars)", len(full_prompt))
        return full_prompt

    def execute_tool(self, name: str, args: dict):
        self._ensure_services()
        self.logger.info("Executing tool %s args=%s", name, args or {})
        args = args or {}
        
        # Dispatch table
        dispatch = {
            "list_schemas": lambda: self.schema.get_schemas(),
            "list_tables": lambda: self.schema.get_table_names(args.get("schema")),
            "get_columns": lambda: self.schema.get_table_columns(args.get("table"), args.get("schema")),
            "get_primary_keys": lambda: self.schema.get_primary_keys(args.get("schema"), args.get("table")),
            "get_foreign_keys": lambda: self.schema.get_foreign_keys(args.get("schema"), args.get("table")),
            "describe_table": lambda: self.schema.describe_table(args.get("schema"), args.get("table")),
            "describe_schema": lambda: self.schema.get_schema_grouped(args.get("schema")),
            "get_table_sample": lambda: self.db.execute(
            f"SELECT * FROM {args.get('schema')}.{args.get('table')} LIMIT {int(args.get('limit', 5))}"
            ),
            "execute_query": lambda: self.db.execute(args.get("sql")),
            "execute_sql_write": lambda: self.db.execute(args.get("sql")),
        }

        return dispatch.get(name, lambda: {"error": f"Unknown tool: {name}"})()

    def safe_json_parse(self, text: str):
        # Removed markdown fences
        cleaned = text.replace("```json", "").replace("```", "").strip()

        # Added balanced JSON extractor
        brace_stack = []
        start = None
        json_str = None

        for i, char in enumerate(cleaned):
            if char == "{":
                if start is None:
                    start = i
                brace_stack.append("{")
            elif char == "}":
                if brace_stack:
                    brace_stack.pop()
                if start is not None and not brace_stack:
                    json_str = cleaned[start : i + 1]
                    break

        if json_str is None:
            self.logger.error("No balanced JSON object found in text")
            return None

        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass

        # Repaired parsing
        repaired = re.sub(r",\s*}", "}", json_str)
        repaired = re.sub(r",\s*]", "]", repaired)

        try:
            return json.loads(repaired)
        except Exception as e:
            self.logger.error("JSON parse failed after repair: %s", str(e))
            self.logger.error("Content was: %s", repaired)
            return None

    def run(self, user_input: str):

        self.logger.info("Agent started for: %s", user_input)
        messages = []
        max_steps = 12

        for _ in range(max_steps):
            prompt = self.build_prompt(user_input, messages)
            response = self.llm.run_text(prompt)

            # Added ANSI cleaner
            response = self._clean_llm_output(response)

            if "TOOL_CALL:" in response:
                block = response.split("TOOL_CALL:", 1)[1].strip()
                tool_call = self.safe_json_parse(block)

                if not tool_call:
                    return {"error": "Invalid tool-call JSON"}

                name = tool_call["name"]
                args = tool_call.get("arguments", {})


                result = self.execute_tool(name, args)
                messages.append({"role": "tool", "content": json.dumps(result)})
                continue

            if "FINAL_SQL:" in response:
                block = response.split("FINAL_SQL:", 1)[1].strip()
                final = self.safe_json_parse(block)

                if not final:
                    return {"error": "Invalid FINAL_SQL JSON"}

                return final

            messages.append({"role": "assistant", "content": response})

        self.logger.error("Max steps reached")
        return {"error": "max_steps_reached"}

    def _clean_llm_output(self, text: str) -> str:
        # Added cleanup for ANSI artifacts
        text = re.sub(r"\x1b\\[[0-9;]*[a-zA-Z]", "", text)
        text = re.sub(r"[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]", "", text)
        text = re.sub(r"\[\?2004[hl]", "", text)
        text = text.replace("```json", "").replace("```", "")
        return text.strip()
