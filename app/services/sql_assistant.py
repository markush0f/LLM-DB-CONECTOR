import json
from pathlib import Path
from app.core.logger import create_logger
from app.services.llm_service import LocalLLMConnector
from app.services.schema_service import SchemaService
from app.services.internal_database_service import DatabaseService


class SQLAssistantService:

    logger = create_logger("sql_assistant")

    def __init__(self):
        self.llm = LocalLLMConnector()
        self.schema = SchemaService()
        self.db = DatabaseService()

        tools_path = (
            Path(__file__).resolve().parent.parent
            / "common"
            / "tools"
            / "sql_tools.json"
        )
        with open(tools_path, "r", encoding="utf-8") as f:
            self.tools = json.load(f)

        self.logger.info("SQLAssistantService initialized successfully")

    def build_prompt(self, user_input: str, messages: list):
        tool_block = json.dumps(self.tools, indent=2)

        system_message = f"""
            You are an advanced SQL planning agent.
            Your goal is to generate correct and safe SQL.

            TOOLS:
            {tool_block}

            TOOL CALL FORMAT:
            TOOL_CALL:
            {{
                "name": "...",
                "arguments": {{ ... }}
            }}

            FINAL FORMAT:
            FINAL_SQL:
            {{
                "sql": "...",
                "explanation": "..."
            }}
            """

        history_text = ""
        for msg in messages:
            history_text += f"{msg['role'].upper()}: {msg['content']}\n"

        full_prompt = f"{system_message}\n\nUSER: {user_input}\n{history_text}"

        self.logger.debug("🔧 Built prompt for LLM:\n%s", full_prompt)

        return full_prompt

    def execute_tool(self, name: str, args: dict):
        self.logger.info("🛠 Executing tool: %s | Args: %s", name, args)

        try:
            match name:
                case "list_schemas":
                    result = self.schema.get_schemas()

                case "list_tables":
                    result = self.schema.get_table_names(args["schema"])

                case "get_columns":
                    result = self.schema.get_table_columns(
                        args["table"], args["schema"]
                    )

                case "get_primary_keys":
                    result = self.schema.get_primary_keys(args["schema"], args["table"])

                case "get_foreign_keys":
                    result = self.schema.get_foreign_keys(args["schema"], args["table"])

                case "describe_table":
                    result = self.schema.describe_table(args["schema"], args["table"])

                case "describe_schema":
                    result = self.schema.get_schema_grouped(args["schema"])

                case "get_table_sample":
                    sql = (
                        f"SELECT * FROM {args['schema']}.{args['table']} "
                        f"LIMIT {args.get('limit', 5)}"
                    )
                    result = self.db.execute(sql)

                case "execute_query":
                    result = self.db.execute(args["sql"])

                case "execute_sql_write":
                    result = self.db.execute(args["sql"])

                case _:
                    result = {"error": f"Unknown tool: {name}"}

            self.logger.info("🧪 Tool result: %s", result)
            return result

        except Exception as e:
            self.logger.error("❌ Tool execution error [%s]: %s", name, str(e))
            return {"error": str(e)}

    def run(self, user_input: str):
        self.logger.info("🚀 Starting agent for user input: %s", user_input)

        messages = []
        max_steps = 12

        for step in range(max_steps):
            self.logger.info("🔄 Agent step %d/%d", step + 1, max_steps)

            prompt = self.build_prompt(user_input, messages)
            response = self.llm.run_text(prompt)

            self.logger.debug("🤖 Raw LLM response:\n%s", response)
            
            if "TOOL_CALL:" in response:
                try:
                    json_block = response.split("TOOL_CALL:")[1].strip()
                    self.logger.debug("🔍 Extracted TOOL_CALL JSON:\n%s", json_block)

                    tool_call = json.loads(json_block)
                except Exception as e:
                    self.logger.error("❌ Invalid TOOL_CALL JSON: %s", str(e))
                    return {"error": "Model produced invalid tool call JSON"}

                name = tool_call["name"]
                args = tool_call.get("arguments", {})

                self.logger.info("🛠 Calling tool '%s' with arguments %s", name, args)
                tool_result = self.execute_tool(name, args)

                messages.append({"role": "tool", "content": json.dumps(tool_result)})
                continue


            if "FINAL_SQL:" in response:
                self.logger.info("🎉 FINAL_SQL detected")

                try:
                    json_block = response.split("FINAL_SQL:")[1].strip()
                    self.logger.debug("📦 Extracted FINAL_SQL JSON:\n%s", json_block)

                    final_sql = json.loads(json_block)
                    self.logger.info("✅ Final SQL: %s", final_sql)
                    return final_sql

                except Exception as e:
                    self.logger.error("❌ Invalid FINAL_SQL JSON: %s", str(e))
                    return {"error": "Model produced invalid FINAL_SQL JSON"}

            self.logger.debug("💬 Assistant intermediate message:\n%s", response)

            messages.append({"role": "assistant", "content": response})

        self.logger.error("⛔ Agent reached max steps without FINAL_SQL")
        return {"error": "Agent reached max steps without producing FINAL_SQL"}
