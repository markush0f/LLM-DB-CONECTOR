import json
from pathlib import Path
from app.core.logger import create_logger
from app.services.llm_service import LocalLLMConnector
from app.services.schema_service import SchemaService
from app.services.internal_database_service import DatabaseService


SYSTEM_PROMPT = """
You are SQL-AGENT, a step-by-step SQL planning agent that ONLY operates through tool-calls.

IMPORTANT:
- NEVER guess table names or columns.
- ALWAYS call tools to inspect the database before generating SQL.
- ALWAYS verify primary/foreign keys before writing JOINs.
- ALWAYS verify table structure before INSERT/UPDATE/DELETE.

Allowed JSON formats:

TOOL_CALL:
{
    "name": "...",
    "arguments": { ... }
}

FINAL_SQL:
{
    "sql": "...",
    "explanation": "..."
}

Never return markdown, comments, explanations or natural text outside JSON.
No alternative formats. No variations. EXACT JSON only.
"""


class SQLAssistantService:

    logger = create_logger()

    def __init__(self):
        self.llm = LocalLLMConnector()
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

    # ----------------------------------------
    # Lazy-loaded services
    # ----------------------------------------
    def _ensure_services(self):
        if self.schema is None:
            self.schema = SchemaService()
        if self.db is None:
            self.db = DatabaseService()

    # ----------------------------------------
    # Build prompt
    # ----------------------------------------
    def build_prompt(self, user_input: str, messages: list):
        tool_block = json.dumps(self.tools, indent=2)

        system = SYSTEM_PROMPT + "\nAVAILABLE_TOOLS:\n" + tool_block

        history_text = ""
        for msg in messages:
            history_text += f"{msg['role'].upper()}: {msg['content']}\n"

        final_prompt = f"{system}\n\nUSER: {user_input}\n{history_text}"

        self.logger.debug("----- PROMPT SENT TO MODEL -----\n%s", final_prompt)
        return final_prompt

    # ----------------------------------------
    # Execute a tool
    # ----------------------------------------
    def execute_tool(self, name: str, args: dict):
        self._ensure_services()

        self.logger.info("Executing tool '%s' with args=%s", name, args)

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
                sql = f"SELECT * FROM {args['schema']}.{args['table']} LIMIT {args.get('limit',5)}"
                return self.db.execute(sql)

            case "execute_query":
                return self.db.execute(args["sql"])

            case "execute_sql_write":
                return self.db.execute(args["sql"])

            case _:
                return {"error": f"Unknown tool: {name}"}

    # ----------------------------------------
    # Run the full agent loop
    # ----------------------------------------
    def run(self, user_input: str):

        self.logger.info("Agent started for: %s", user_input)

        messages = []
        max_steps = 15

        for step in range(max_steps):
            self.logger.info("Step %d/%d", step + 1, max_steps)

            prompt = self.build_prompt(user_input, messages)
            response = self.llm.run_text(prompt)

            self.logger.debug("----- RAW MODEL RESPONSE -----\n%s", response)
            self.logger.debug("----- CURRENT CONTEXT -----\n%s", messages)

            # 1. TOOL CALL
            if "TOOL_CALL:" in response:
                json_block = response.split("TOOL_CALL:")[1].strip()

                try:
                    tool_call = json.loads(json_block)
                except Exception as e:
                    self.logger.error("Failed to parse tool JSON: %s", str(e))
                    return {"error": "Invalid TOOL_CALL JSON"}

                name = tool_call["name"]
                args = tool_call.get("arguments", {})

                tool_result = self.execute_tool(name, args)

                messages.append({"role": "tool", "content": json.dumps(tool_result)})
                continue

            # 2. FINAL SQL
            if "FINAL_SQL:" in response:
                json_block = response.split("FINAL_SQL:")[1].strip()

                try:
                    final_sql = json.loads(json_block)
                except Exception as e:
                    self.logger.error("Failed to parse final SQL JSON: %s", str(e))
                    return {"error": "Invalid FINAL_SQL JSON"}

                self.logger.info("Final SQL completed")
                return final_sql

            # 3. Otherwise model is thinking
            messages.append({"role": "assistant", "content": response})

        self.logger.error("Max steps reached with no final SQL")
        return {"error": "No FINAL_SQL produced. Model may require better prompt."}
