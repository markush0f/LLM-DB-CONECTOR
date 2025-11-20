import json
from pathlib import Path
from app.core.logger import create_logger
from app.repository.assistant_message_repository import AssistantMessageRepository
from app.repository.user_message_repository import UserMessageRepository
from app.services.llm_service import LocalLLMConnector
from app.services.model_service import ModelService
from app.utils.prompt_builder import PromptBuilder
from app.utils.json_parser import JSONParser
from app.utils.tool_executor import ToolExecutor


class SQLAssistantService:
    def __init__(self):
        self.logger = create_logger()
        self.model_service = ModelService()

        self.llm = None
        self.current_model_name = None

        self.user_repo = UserMessageRepository()
        self.assistant_repo = AssistantMessageRepository()

        tools = self._load_tools()
        self.prompt_builder = PromptBuilder(tools)
        self.tool_executor = ToolExecutor()
        self.json_parser = JSONParser()

        self.logger.info("SQLAssistantService initialized")

    def load_model_from_active_model(self):
        model = self.model_service.get_active_model()
        self.logger.info("Active model: %s", model)

        if not model:
            raise RuntimeError("No active model selected.")

        if self.current_model_name == model.model_name:
            return

        self.llm = LocalLLMConnector(
            model_name=model.model_name,
            use_gpu=True,
            temperature=model.temperature,
            top_p=model.top_p,
            seed=model.seed,
        )

        self.current_model_name = model.model_name
        self.logger.info(f"Model loaded: {model.model_name}")

    def run(self, user_input: str):
        # Load active LLM model
        self.load_model_from_active_model()

        self.logger.info("Agent started for: %s", user_input)

        # get model settings
        settings = self.model_service.get_active_model()
        system_prompt = settings.system_prompt
        context = settings.context

        # Store user message
        user_message = self._save_user_message(user_input)

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
            prompt = self.prompt_builder.build(
                user_input=user_input,
                messages=messages,
                system_prompt=system_prompt,
                context=context,
            )

            raw_output = self._run_model(prompt)
            cleaned = self.json_parser.clean_output(raw_output)

            tool_block = self.json_parser.extract_block(cleaned, "TOOL_CALL")
            if tool_block:
                parsed = self.json_parser.safe_parse(tool_block)
                if parsed:
                    selected_schema = self._process_tool_call(
                        parsed, selected_schema, messages, tools_requiring_schema
                    )
                    continue

            implicit = self.json_parser.safe_parse(cleaned)
            if (
                implicit
                and isinstance(implicit, dict)
                and "name" in implicit
                and "arguments" in implicit
                and "sql" not in implicit
            ):
                selected_schema = self._process_implicit_tool_call(
                    implicit, selected_schema, messages, tools_requiring_schema
                )

            final_sql = self._process_final_sql(cleaned)
            if final_sql:
                self._save_assistant_message(json.dumps(final_sql), user_message.id)
                return final_sql

            if implicit and "sql" in implicit:
                self._save_assistant_message(json.dumps(implicit), user_message.id)
                return implicit

            messages.append({"role": "assistant", "content": cleaned})
            self._save_assistant_message(cleaned, user_message.id)

            return {"response": cleaned}

        return {"error": "max_steps_reached"}

    def _save_user_message(self, text: str):
        return self.user_repo.save(content=text, model_name=self.current_model_name)

    def _save_assistant_message(self, text: str, parent_id: int):
        return self.assistant_repo.save(
            content=text,
            model_name=self.current_model_name,
            user_message_id=parent_id,
        )

    def _load_tools(self):
        tools_path = (
            Path(__file__).resolve().parent.parent
            / "common"
            / "tools"
            / "sql_tools.json"
        )
        with open(tools_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _build_prompt(self, user_input, messages):
        return self.prompt_builder.build(user_input, messages)

    def _run_model(self, prompt):
        return self.llm.run_text(prompt)

    def _prepare_tool_result(self, name, args, result):
        return {
            "role": "tool",
            "name": name,
            "content": json.dumps({"tool": name, "arguments": args, "result": result}),
        }

    def _handle_schema_autoselect(self, tool_name, result, selected_schema):
        if tool_name == "list_schemas" and isinstance(result, list):
            if len(result) == 1:
                return result[0]
        return selected_schema

    def _should_insert_schema(
        self, tool_name, args, selected_schema, tools_requiring_schema
    ):
        if tool_name in tools_requiring_schema:
            if args.get("schema") in [None, "<default_schema>"]:
                if selected_schema:
                    args["schema"] = selected_schema
        return args

    def _process_tool_call(
        self, parsed, selected_schema, messages, tools_requiring_schema
    ):
        name = parsed.get("name")
        args = parsed.get("arguments", {})
        args = self._should_insert_schema(
            name, args, selected_schema, tools_requiring_schema
        )

        result = self.tool_executor.execute(name, args)

        messages.append(self._prepare_tool_result(name, args, result))
        selected_schema = self._handle_schema_autoselect(name, result, selected_schema)

        return selected_schema

    def _process_implicit_tool_call(
        self, implicit, selected_schema, messages, tools_requiring_schema
    ):
        name = implicit["name"]
        args = implicit.get("arguments", {})
        args = self._should_insert_schema(
            name, args, selected_schema, tools_requiring_schema
        )

        result = self.tool_executor.execute(name, args)

        messages.append(self._prepare_tool_result(name, args, result))

        return selected_schema

    def _process_final_sql(self, cleaned):
        final_block = self.json_parser.extract_block(cleaned, "FINAL_SQL")
        if not final_block:
            return None

        final = self.json_parser.parse_final_sql(final_block)
        if final:
            return final

        return {"error": "Invalid FINAL_SQL JSON"}
