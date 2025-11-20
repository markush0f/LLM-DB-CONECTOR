from app.core.logger import create_logger
from app.repository.model_repository import ModelRepository
from app.repository.active_model_repository import ActiveModelRepository
from app.models.schemas.model_schema import Model


class ModelService:
    def __init__(self):
        self.logger = create_logger()
        self.repo = ModelRepository()
        self.repo_active = ActiveModelRepository()

    def get_settings(self, model_name: str) -> Model | None:
        return self.repo.get_by_model(model_name)

    def update_settings(self, model_name: str, **updates):
        return self.repo.set_settings(model_name, **updates)

    def set_system_prompt(self, model_name: str, new_prompt: str):
        return self.repo.set_settings(model_name, system_prompt=new_prompt)

    def set_context(self, model_name: str, new_context: str):
        return self.repo.set_settings(model_name, context=new_context)

    def create_default(self, model_name: str):
        default_settings = {
            "system_prompt": "You are a helpful SQL generation assistant.",
            "context": "",
            "temperature": 0.2,
            "top_p": 1.0,
            "seed": None,
        }
        return self.repo.set_settings(model_name, **default_settings)

    def create_model(
        self,
        model_name: str,
        system_prompt: str,
        context: str,
        temperature: float,
        top_p: float,
        seed: int | None,
    ):
        model = Model(
            model_name=model_name,
            system_prompt=system_prompt,
            context=context,
            temperature=temperature,
            top_p=top_p,
            seed=seed,
        )
        self.logger.info(f"Creating new model: {model}")
        return self.repo.create(model)

    def get_all_models(self):
        return self.repo.get_all()

    def get_model_by_id(self, model_id: int):
        return self.repo.get_by_id(model_id)

    def get_active_model(self):
        active = self.repo_active.get_active()
        if not active:
            return None

        return self.repo.get_by_id(active.model_id)

    def set_active_model(self, model_id: int):
        """
        Set the active model by its ID.
        """
        return self.repo_active.set_active(model_id)

    def delete_model(self, model_id: int):
        return self.repo.delete(model_id)
