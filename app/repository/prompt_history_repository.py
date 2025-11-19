from sqlmodel import select
from app.models.schemas.prompt_history_schema import PromptHistory
from app.repositories.base_repository import BaseRepository


class PromptHistoryRepository(BaseRepository):
    model = PromptHistory

    # Custom method
    def save_prompt(self, prompt: str, output: str, model_name: str):
        record = PromptHistory(
            user_input=prompt,
            model_output=output,
            model_name=model_name
        )
        return self.create(record)
