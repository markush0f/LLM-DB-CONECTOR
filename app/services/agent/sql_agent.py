import json
from pathlib import Path
from app.core.logger import create_logger
from app.services.llm_service import LocalLLMConnector
from app.services.agent.prompt_builder import PromptBuilder
from app.services.agent.tool_executor import ToolExecutor
from app.services.agent.json_parser import JSONParser


class SQLAssistantService:

    def __init__(self):
        self.logger = create_logger()
        self.llm = LocalLLMConnector(model_name="qwen2.5-coder:14b", use_gpu=True)

        tools_path = (
            Path(__file__).resolve().parent.parent.parent
            / "common"
            / "tools"
            / "sql_tools.json"
        )
        with open(tools_path, "r", encoding="utf-8") as f:
            tools = json.load(f)

        self.prompt_builder = PromptBuilder(tools)
        self.tool_executor = ToolExecutor()
        self.json_parser = JSONParser()

        self.logger.info("SQLAssistantService initialized")

    def run(self, user_input: str):
        self.logger.info("Agent started for: %s", user_input)

        messages = []
        max_steps = 10

        selected_schema = None
        tools_requiring_schema = {
            "list_tables",
            "get_columns",
            "get_primary_keys",
            "get_foreign_keys",
            "describe_table",
            "describe_schema",
            "get_table_sample",
        }

        for step in range(max_steps):
            prompt = self.prompt_builder.build(user_input, messages)
            raw = self.llm.run_text(prompt)
            cleaned = self.json_parser.clean_output(raw)

            tool_block = self.json_parser.extract_block(cleaned, "TOOL_CALL")
            if tool_block:
                parsed = self.json_parser.safe_parse(tool_block)

                if parsed:
                    name = parsed.get("name")
                    args = parsed.get("arguments", {})

                    if name in tools_requiring_schema:
                        if args.get("schema") in [None, "<default_schema>"]:
                            if selected_schema:
                                args["schema"] = selected_schema

                    result = self.tool_executor.execute(name, args)

                    # CHANGE: correct tool-call response format
                    messages.append({
                        "role": "tool",
                        "name": name,
                        "content": json.dumps({
                            "tool": name,
                            "arguments": args,
                            "result": result
                        })
                    })

                    # Auto-select schema if only one exists
                    if name == "list_schemas" and isinstance(result, list):
                        if len(result) == 1:
                            selected_schema = result[0]

                    continue

            implicit = self.json_parser.safe_parse(cleaned)

            # CHANGE: handles implicit tool calls
            if (
                implicit
                and isinstance(implicit, dict)
                and "name" in implicit
                and "arguments" in implicit
                and "sql" not in implicit
            ):
                name = implicit["name"]
                args = implicit.get("arguments", {})

                if name in tools_requiring_schema:
                    if args.get("schema") in [None, "<default_schema>"]:
                        if selected_schema:
                            args["schema"] = selected_schema

                result = self.tool_executor.execute(name, args)

                # CHANGE: structured tool response
                messages.append({
                    "role": "tool",
                    "name": name,
                    "content": json.dumps({
                        "tool": name,
                        "arguments": args,
                        "result": result
                    })
                })
                continue

            # FINAL_SQL block detected
            final_block = self.json_parser.extract_block(cleaned, "FINAL_SQL")
            if final_block:
                final = self.json_parser.parse_final_sql(final_block)
                if final:
                    return final
                return {"error": "Invalid FINAL_SQL JSON"}

            # Direct SQL return
            if implicit and "sql" in implicit:
                return implicit

            # Normal assistant message
            messages.append({"role": "assistant", "content": cleaned})

        return {"error": "max_steps_reached"}
