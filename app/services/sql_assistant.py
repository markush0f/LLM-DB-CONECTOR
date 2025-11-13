import os
import json
import re
from typing import Dict, Any

from app.services.llm_service import LocalLLMConnector
from app.services.schema_service import SchemaService
from app.services.internal_database_service import DatabaseService


class SQLAssistantService:
    """
    Full SQL Agent: loads tools, builds prompts, handles tool calls,
    queries DB metadata, executes steps until FINAL_SQL.
    """

    def __init__(self):
        self.schema = SchemaService()
        self.db = DatabaseService()

        # Load tools from json
        self.tools = self.load_tools()

        # LLM connector (raw, no tools logic here)
        self.llm = LocalLLMConnector(model_name="mistral:7b-instruct")
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

    def load_tools(self):
        tools_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "..",  # /app
                "common",
                "tools",
                "sql_tools.json",
            )
        )

        if not os.path.exists(tools_path):
            print(f"⚠️ sql_tools.json NOT FOUND: {tools_path}")
            return []

        with open(tools_path, "r", encoding="utf-8") as f:
            tools = json.load(f)

        print(f"🔧 Loaded {len(tools)} SQL tools.")
        return tools

    def build_prompt(self, user_input: str) -> str:
        tools_text = json.dumps(self.tools, indent=2)

        return f"""
            You are a PostgreSQL SQL Agent.

            Before generating SQL, inspect the database using the allowed tools.

            TOOLS:
            {tools_text}

            RULES:
            - If you need information, reply ONLY:
            TOOL_CALL:
            {{"name": "...", "arguments": {{...}}}}

            - When ready to output SQL, reply ONLY:
            FINAL_SQL:
            {{"sql": "...", "explanation": "..."}}

            USER REQUEST:
            {user_input}
            """

    def execute_tool(self, tool_call: Dict[str, Any]) -> Any:
        """
        Execute database tools dynamically using a registry instead of a match-case block.
        """
        name = tool_call["name"]
        args = tool_call.get("arguments", {})

        tool_fn = self.tools_registry.get(name)

        if not tool_fn:
            return {"error": f"Unknown tool: {name}"}

        try:
            return tool_fn(**args)
        except TypeError as e:
            return {"error": f"Invalid arguments for {name}: {e}"}

    def run(self, user_input: str) -> Dict[str, Any]:
        prompt = self.build_prompt(user_input)
        messages = [{"role": "user", "content": prompt}]

        while True:
            output = self.llm.run_raw(messages)
            tool_match = re.search(r"TOOL_CALL:\s*(\{[\s\S]*?\})", output)
            if tool_match:
                tool_call = json.loads(tool_match.group(1))
                result = self.execute_tool(tool_call)

                messages.append({"role": "assistant", "content": output})
                messages.append({"role": "tool", "content": json.dumps(result)})
                continue

            final_match = re.search(r"FINAL_SQL:\s*(\{[\s\S]*?\})", output)
            if final_match:
                return json.loads(final_match.group(1))

            return {"error": "No FINAL_SQL or TOOL_CALL detected", "raw": output}
