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

        # CHANGE: LLM initialized from active model settings
        self.llm = LocalLLMConnector(
            model_name=model.model_name,
            use_gpu=True,
            temperature=model.temperature,
            top_p=model.top_p,
            seed=model.seed,
        )

        self.current_model_name = model.model_name
        self.logger.info("Model loaded: %s", model.model_name)

    def run(self, user_input: str):
        # CHANGE: load model on each request based on active model
        self.load_model_from_active_model()

        settings = self.model_service.get_active_model()
        system_prompt = settings.system_prompt
        context = settings.context

        self.logger.info("Agent started for: %s", user_input)

        user_message = self._save_user_message(user_input)

        selected_schema = None
        last_tool_result = None
        last_tool_name = None

        max_steps = 10
        repeated_same_tool = 0
        max_repeated_calls = 3

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
                system_prompt=system_prompt,
                context=context,
                user_input=user_input,
                last_tool_result=last_tool_result,
                step=step,
                last_tool_name=last_tool_name,
            )

            raw = self.llm.run_text(prompt)
            cleaned = self.json_parser.clean_output(raw)

            # CHANGE: unified parsing for TOOL_CALL (explicit or implicit)
            parsed_tool_call = self._extract_tool_call(cleaned)

            if parsed_tool_call:
                name = parsed_tool_call.get("name")
                args = parsed_tool_call.get("arguments", {}) or {}

                # Detect tool-call loop with same arguments
                if (
                    last_tool_name == name
                    and last_tool_result is not None
                    and last_tool_result.get("arguments") == args
                ):
                    repeated_same_tool += 1
                    self.logger.warning(
                        "Model repeated tool %s with same arguments (%d/%d)",
                        name,
                        repeated_same_tool,
                        max_repeated_calls,
                    )
                else:
                    repeated_same_tool = 0

                if repeated_same_tool >= max_repeated_calls:
                    self.logger.error("Model stuck repeating tool %s", name)
                    break

                if name in tools_requiring_schema and not args.get("schema"):
                    if selected_schema:
                        args["schema"] = selected_schema

                result = self.tool_executor.execute(name, args)
                self.logger.debug("Tool executed: %s args=%s", name, args)

                if (
                    name == "list_schemas"
                    and isinstance(result, list)
                    and len(result) == 1
                ):
                    selected_schema = result[0]
                    self.logger.debug("Auto-selected schema: %s", selected_schema)

                last_tool_name = name
                last_tool_result = {
                    "tool": name,
                    "arguments": args,
                    "result": result,
                }

                continue

            # FINAL_SQL branch
            final_sql = self._extract_final_sql(cleaned)
            if final_sql:
                self._save_assistant_message(json.dumps(final_sql), user_message.id)
                return final_sql

            # CHANGE: direct SQL dict fallback if model skips FINAL_SQL wrapper
            implicit = self.json_parser.safe_parse(cleaned)
            if implicit and isinstance(implicit, dict) and "sql" in implicit:
                self._save_assistant_message(json.dumps(implicit), user_message.id)
                return implicit

        return {"error": "max_steps_reached"}

    def _extract_tool_call(self, cleaned: str) -> dict | None:
        """CHANGE: centralized logic to obtain a tool call from model output."""
        tool_block = self.json_parser.extract_block(cleaned, "TOOL_CALL")
        if tool_block:
            parsed = self.json_parser.safe_parse(tool_block)
            if parsed and isinstance(parsed, dict) and "name" in parsed:
                return parsed

        implicit = self.json_parser.safe_parse(cleaned)
        if (
            implicit
            and isinstance(implicit, dict)
            and "name" in implicit
            and "arguments" in implicit
            and "sql" not in implicit
        ):
            return implicit

        return None

    def _extract_final_sql(self, cleaned: str):
        """CHANGE: small helper to parse FINAL_SQL block."""
        final_block = self.json_parser.extract_block(cleaned, "FINAL_SQL")
        if not final_block:
            return None
        return self.json_parser.parse_final_sql(final_block)

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
