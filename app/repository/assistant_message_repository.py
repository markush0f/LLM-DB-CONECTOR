

from app.internal_db import get_local_session
from app.models.schemas.prompt_schema import AssistantMessage
from app.repository.base_repository import BaseRepository


class AssistantMessageRepository(BaseRepository):
    model = AssistantMessage

    def __init__(self):
        super().__init__(session_factory=get_local_session)

    def save(self, content: str, model_name: str, user_message_id: int):
        message = AssistantMessage(
            content=content,
            model_name=model_name,
            user_message_id=user_message_id
        )
        return self.create(message)
