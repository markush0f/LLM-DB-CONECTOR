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

        # Avoid reloading same model unnecessarily
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
        # Always load active LLM model first
        self.load_model_from_active_model()

        self.logger.info("Agent started for: %s", user_input)

        # Fetch system_prompt & context
        settings = self.model_service.get_active_model()
        system_prompt = settings.system_prompt
        context = settings.context

        # Store user message in DB
        user_message = self._save_user_message(user_input)

        # Build full prompt: system_prompt + context + tools + user_input
        prompt = self.prompt_builder.build(
            system_prompt=system_prompt,
            context=context,
            user_input=user_input,
        )
        self.logger.info("Built prompt: %s", prompt)
        # Run model
        raw_output = self._run_model(prompt)
        cleaned = self.json_parser.clean_output(raw_output)

        # First check TOOL_CALL block
        tool_block = self.json_parser.extract_block(cleaned, "TOOL_CALL")
        if tool_block:
            parsed = self.json_parser.safe_parse(tool_block)
            if parsed:
                result = self.tool_executor.execute(
                    parsed.get("name"), parsed.get("arguments", {})
                )

                self._save_assistant_message(json.dumps(result), user_message.id)
                return result

        # Check FINAL_SQL
        final_sql = self._process_final_sql(cleaned)
        if final_sql:
            self._save_assistant_message(json.dumps(final_sql), user_message.id)
            return final_sql

        # If JSON contains SQL field directly
        implicit = self.json_parser.safe_parse(cleaned)
        if implicit and "sql" in implicit:
            self._save_assistant_message(json.dumps(implicit), user_message.id)
            return implicit

        # Otherwise: FAIL → model did not follow instructions
        self._save_assistant_message(cleaned, user_message.id)
        raise ValueError("Agent did not produce SQL")

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

    def _run_model(self, prompt):
        return self.llm.run_text(prompt)

    def _process_final_sql(self, cleaned):
        final_block = self.json_parser.extract_block(cleaned, "FINAL_SQL")
        if not final_block:
            return None

        final = self.json_parser.parse_final_sql(final_block)
        if final:
            return final

        return {"error": "Invalid FINAL_SQL JSON"}
