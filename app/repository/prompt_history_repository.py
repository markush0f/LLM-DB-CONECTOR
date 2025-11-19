# from app.models.schemas.prompt_schema import Prompt
# from app.repository.base_repository import BaseRepository


# class PromptHistoryRepository(BaseRepository):
#     model = Prompt

#     def save(self, user_input: str, output: str, model_name: str, role: str):
#         prompt = Prompt(
#             user_input=user_input, model_output=output, model_name=model_name, role=role
#         )
#         return self.create(prompt)
