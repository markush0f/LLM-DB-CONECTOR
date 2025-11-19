from sqlmodel import select
from app.models.schemas.model_settings_schema import ModelSettings
from app.repositories.base_repository import BaseRepository


class ModelSettingsRepository(BaseRepository):
    model = ModelSettings

    # Custom method
    def get_settings(self, model_name: str):
        with self._session() as session:
            return session.exec(
                select(ModelSettings).where(ModelSettings.model_name == model_name)
            ).first()
