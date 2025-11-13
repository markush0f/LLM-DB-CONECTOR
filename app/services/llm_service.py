import os
import json
import re
from typing import Dict, Any, List

from app.services.llm_service import LocalLLMConnector
from app.services.schema_service import SchemaService
from app.services.internal_database_service import DatabaseService


class SQLAssistantService:
    """
    SQL Agent Service.
    Controls:
    - tool loading
    - prompt generation
    - tool-call execution
    - reasoning loop
    - final SQL extraction
    """

    def __init__(self):
        self.schema = SchemaService()
        self.db = DatabaseService()

        self.tools = self.load_tools()
        self.llm = LocalLLMConnector(model_name="mistral:7b-instruct")

        # REGISTER TOOLS AS PYTHON FUNCTIONS
        self.tools_registry = {
            "list_schemas": self.tool_list_schemas,
            "list_tables": self.tool_list_tables,
            "get_columns": self.tool_get_columns,
            "get_primary_keys": self.tool_get_primary_keys,
            "get_foreign_keys": self.tool_get_foreign_keys,
            "describe_table": self.tool_describe_table,
            "describe_schema": self.tool_describe_schema,
            "get_table_sample": self.tool_get_table_sample,
            "execute_query": self.tool_execute_query,
            "execute_sql_write": self.tool_execute_sql_write,
        }

    # ------------------------------------------------------------------
    # LOAD TOOLS JSON
    # ------------------------------------------------------------------
    def load_tools(self) -> List[dict]:
        tools_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__), "..", "common", "tools", "sql_tools.json"
            )
        )
        if not os.path.exists(tools_path):
            print(f"⚠️ sql_tools.json not found at {tools_path}")
            return []

        with open(tools_path, "r", encoding="utf-8") as f:
            tools = json.load(f)

        print(f"🔧 Loaded {len(tools)} SQL tools.")
        return tools

    # ------------------------------------------------------------------
    # BUILD AGENT PROMPT
    # ------------------------------------------------------------------
    def build_prompt(self, user_input: str) -> str:
        tools_text = json.dumps(self.tools, indent=2)

        return f"""
You are a PostgreSQL SQL Agent.

Before writing SQL, you MUST inspect the database using the available tools.

TOOLS:
{tools_text}

RULES:
1. When you need info, output ONLY:
TOOL_CALL:
{{"name": "...", "arguments": {{...}}}}

2. When you know enough, output ONLY:
FINAL_SQL:
{{"sql": "...", "explanation": "..."}}

DO NOT output anything else.

USER REQUEST:
{user_input}
"""

    # ------------------------------------------------------------------
    # TOOL EXECUTOR (clean)
    # ------------------------------------------------------------------
    def execute_tool(self, tool_call: dict):
        name = tool_call["name"]
        args = tool_call.get("arguments", {})

        if name not in self.tools_registry:
            return {"error": f"Unknown tool: {name}"}

        try:
            return self.tools_registry[name](**args)
        except TypeError as e:
            return {"error": f"Invalid arguments for {name}: {e}"}


    def tool_list_schemas(self):
        return self.schema.get_schemas()

    def tool_list_tables(self, schema: str):
        return self.schema.get_table_names(schema)

    def tool_get_columns(self, schema: str, table: str):
        return self.schema.get_table_columns(schema, table)

    def tool_get_primary_keys(self, schema: str, table: str):
        return self.schema.get_primary_keys(schema, table)

    def tool_get_foreign_keys(self, schema: str, table: str):
        return self.schema.get_foreign_keys(schema, table)

    def tool_describe_table(self, schema: str, table: str):
        return self.schema.get_schema_grouped(schema).get(f"{schema}.{table}")

    def tool_describe_schema(self, schema: str):
        return self.schema.get_schema_grouped(schema)

    def tool_get_table_sample(self, schema: str, table: str, limit: int = 5):
        sql = f"SELECT * FROM {schema}.{table} LIMIT {limit}"
        return self.db.execute(sql)

    def tool_execute_query(self, sql: str):
        return self.db.execute(sql)

    def tool_execute_sql_write(self, sql: str):
        return self.db.execute(sql)

    def agent_loop(self, user_input: str) -> Dict[str, Any]:
        messages = [{"role": "user", "content": self.build_prompt(user_input)}]

        while True:
            output = self.llm.run_raw(messages)

            # Detect tool call
            tool_call_match = re.search(r"TOOL_CALL:\s*(\{[\s\S]*?\})", output)
            if tool_call_match:
                tool_call = json.loads(tool_call_match.group(1))
                result = self.execute_tool(tool_call)

                messages.append({"role": "assistant", "content": output})
                messages.append({"role": "tool", "content": json.dumps(result)})
                continue

            # Detect final SQL
            final_sql_match = re.search(r"FINAL_SQL:\s*(\{[\s\S]*?\})", output)
            if final_sql_match:
                return json.loads(final_sql_match.group(1))

            return {"error": "LLM did not produce FINAL_SQL", "raw": output}

    def run(self, user_input: str):
        return self.agent_loop(user_input)
