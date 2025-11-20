from app.internal_db import get_local_session
from app.models.schemas.prompt_schema import UserMessage
from app.repository.base_repository import BaseRepository
from sqlmodel import select, func


class UserMessageRepository(BaseRepository):
    model = UserMessage

    def __init__(self):
        super().__init__(session_factory=get_local_session)

    def save(self, content: str, model_name: str):
        message = UserMessage(content=content, model_name=model_name)
        return self.create(message)

    def get_all(self):
        return super().get_all()

    def get_by_id(self, id: int):
        return super().get_by_id(id)

    def get_paginated(self, page: int, limit: int):
        return super().get_paginated(page, limit)

    def count(self):
        session = self.session_factory()
        try:
            statement = select(func.count(self.model.id))
            result = session.exec(statement).one()
            return result
        finally:
            session.close()

    def get_models_used(self):
        session = self.session_factory()
        try:
            statement = select(self.model.model_name).distinct()
            rows = session.exec(statement).all()
            return rows
        finally:
            session.close()
