from app.repository.active_model_repository import ActiveModelRepository
from app.repository.model_repository import ModelRepository


class ActiveModelService:
    def __init__(self):
        self.active_repo = ActiveModelRepository()
        self.settings_repo = ModelRepository()

    def get_active_model(self):
        return self.active_repo.get_active()

    def set_active_model(self, model_settings_id: int):
        return self.active_repo.set_active(model_settings_id)
