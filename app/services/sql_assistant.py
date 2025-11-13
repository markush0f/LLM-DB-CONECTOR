import json
from app.services.llm_service import LocalLLMConnector
from app.services.schema_service import SchemaService
from app.services.internal_database_service import DatabaseService


class SQLAssistantService:

    def __init__(self):
        self.llm = LocalLLMConnector()
        self.schema = SchemaService()
        self.db = DatabaseService()

        # Load tool definitions
        tools_path = (
            Path(__file__).resolve().parent.parent
            / "common"
            / "tools"
            / "sql_tools.json"
        )
        with open(tools_path, "r", encoding="utf-8") as f:
            self.tools = json.load(f)

    # ------------------------------------------------------------------
    # Build prompt for the model
    # ------------------------------------------------------------------
    def build_prompt(self, user_input: str, messages: list):
        tool_block = json.dumps(self.tools, indent=2)

        system_message = f"""
            You are an advanced SQL planning agent.
            Your goal is to generate **correct and safe SQL** based on user requests.

            You have access to these TOOLS:
            {tool_block}

            You may call tools using this EXACT JSON format:

            TOOL_CALL:
            {{
                "name": "tool_name_here",
                "arguments": {{
                    ... params ...
                }}
            }}

            When you finish ALL reasoning and have the FINAL SQL ready, respond ONLY with:

            FINAL_SQL:
            {{
                "sql": "...",
                "explanation": "..."
            }}

            Rules:
            - NEVER guess table names or columns.
            - ALWAYS call tools if you lack schema information.
            - ALWAYS verify referenced tables and columns.
            - ALWAYS check foreign keys or relationships before writing JOINs.
            - ALWAYS ensure PK/FK consistency before generating DDL or INSERTs.
            """

        history_text = ""
        for msg in messages:
            history_text += f"{msg['role'].upper()}: {msg['content']}\n"

        return f"{system_message}\n\nUSER: {user_input}\n{history_text}"

    def execute_tool(self, name: str, args: dict):
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
                return self.db.execute(
                    f"SELECT * FROM {args['schema']}.{args['table']} LIMIT {args.get('limit',5)}"
                )

            case "execute_query":
                return self.db.execute(args["sql"])

            case "execute_sql_write":
                return self.db.execute(args["sql"])

            case _:
                return {"error": f"Unknown tool: {name}"}

    def run(self, user_input: str):
        messages = []
        max_steps = 8

        for _ in range(max_steps):
            prompt = self.build_prompt(user_input, messages)
            response = self.llm.run_text(prompt)

            if "TOOL_CALL:" in response:
                json_block = response.split("TOOL_CALL:")[1].strip()

                try:
                    tool_call = json.loads(json_block)
                except:
                    return {"error": "Model produced invalid tool call JSON"}

                name = tool_call["name"]
                args = tool_call.get("arguments", {})

                tool_result = self.execute_tool(name, args)

                messages.append({"role": "tool", "content": json.dumps(tool_result)})

                continue

            if "FINAL_SQL:" in response:
                json_block = response.split("FINAL_SQL:")[1].strip()
                try:
                    sql_final = json.loads(json_block)
                    return sql_final
                except Exception:
                    return {"error": "Model produced invalid FINAL_SQL JSON"}

            messages.append({"role": "assistant", "content": response})

        return {"error": "Agent reached max steps without producing FINAL_SQL"}
