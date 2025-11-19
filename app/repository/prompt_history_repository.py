
from app.models.schemas.prompt_schema import Prompt
from app.repository.base_repository import BaseRepository


class PromptHistoryRepository(BaseRepository):
    model = Prompt

    # Custom method
    def save_prompt(self, prompt: str, output: str, model_name: str):
        record = Prompt(user_input=prompt, model_output=output, model_name=model_name)
        return self.create(record)
