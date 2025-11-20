from datetime import datetime
from app.internal_db import get_local_session
from app.models.schemas.model_schema import Model
from app.repository.base_repository import BaseRepository


class ModelRepository(BaseRepository):
    model = Model

    def __init__(self):
        super().__init__(session_factory=get_local_session)

    def get_by_model(self, model_name: str):
        return (
            self.session.query(Model)
            .filter(Model.model_name == model_name)
            .first()
        )

    def set_settings(self, model_name: str, **kwargs):
        entry = self.get_by_model(model_name)

        if entry:
            for key, value in kwargs.items():
                setattr(entry, key, value)
            entry.updated_at = datetime.utcnow()
            return self.update(entry)

        new_entry = Model(model_name=model_name, **kwargs)
        return self.create(new_entry)
