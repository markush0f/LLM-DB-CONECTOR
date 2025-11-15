import json
import re
from pathlib import Path
from app.core.logger import create_logger
from app.services.llm_service import LocalLLMConnector
from app.services.schema_service import SchemaService
from app.services.internal_database_service import DatabaseService

SYSTEM_PROMPT = """
You are SQL-AGENT, a deterministic SQL planning engine.

Your ONLY job is:
1. Inspect the database using tools.
2. Build correct SQL based on real schema information.
3. Output the final SQL strictly inside FINAL_SQL JSON.

IMPORTANT RULES:
- You MUST NOT guess table names, column names, types, constraints, keys or relationships.
- If you do NOT know something, ALWAYS call a tool.
- You must gather ALL required metadata before generating SQL.
- Before writing JOINs: ALWAYS call get_foreign_keys.
- Before INSERT/UPDATE/DELETE: ALWAYS describe_table and validate required columns.
- Before SELECT: ALWAYS verify columns using get_columns.

SEQUENCE YOU MUST FOLLOW:
1. Understand the user request.
2. Identify required tables.
3. If schema/table existence is unknown → call list_schemas / list_tables.
4. If table found → call describe_table, get_columns, get_primary_keys, get_foreign_keys.
5. After all required metadata is collected, generate SQL.
6. Output FINAL_SQL ONLY when the SQL is fully validated.

ALLOWED OUTPUT FORMATS (STRICT):
TOOL_CALL:
{
  "name": "<tool_name>",
  "arguments": { ... }
}

FINAL_SQL:
{
  "sql": "<the query>",
  "explanation": "<very short, 1-3 lines>"
}

Do NOT output anything else. No markdown. No comments. No text outside JSON.
Do NOT output multiple JSON blocks at once.
Do NOT invent arguments or omit required fields.

If the user asks for creative data (e.g., "10 sample records"), you MUST:
- extract table metadata
- generate INSERT statements that match column types
- avoid NULL unless the column is nullable.

If you do not have enough metadata to create safe SQL → call a tool.
"""


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
        self.logger.info("Executing tool %s args=%s", name, args)

        match name:
            case "list_schemas":
                return self.schema.get_schemas()
            case "list_tables":
                return self.schema.get_table_names(args["schema"])
            case "get_columns":
                return self.schema.get_table_columns(args["table"], args["schema"])
            case "get_primary_keys":
                return self.schema.get_primary_keys(args["schema"], args["table"])
            case "get_foreign_keys":
                return self.schema.get_foreign_keys(args["schema"], args["table"])
            case "describe_table":
                return self.schema.describe_table(args["schema"], args["table"])
            case "describe_schema":
                return self.schema.get_schema_grouped(args["schema"])
            case "get_table_sample":
                sql = f"SELECT * FROM {args['schema']}.{args['table']} LIMIT {args.get('limit', 5)}"
                return self.db.execute(sql)
            case "execute_query":
                return self.db.execute(args["sql"])
            case "execute_sql_write":
                return self.db.execute(args["sql"])
            case _:
                return {"error": f"Unknown tool: {name}"}

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
                    if not brace_stack and start is not None:
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

                # valid, error = self.validate_tool_call(name, args)
                # if not valid:
                #     return {"error": error}

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
