from app.repository.user_message_repository import UserMessageRepository
from app.repository.assistant_message_repository import AssistantMessageRepository
from app.core.logger import create_logger
from fastapi import HTTPException


class MessageService:
    def __init__(self):
        self.logger = create_logger()
        self.user_message_repository = UserMessageRepository()
        self.assistant_message_repository = AssistantMessageRepository()

    def get_user_messages(self, page: int, limit: int):
        return self.user_message_repository.get_paginated(page, limit)

    def get_assistant_messages(self, page: int, limit: int):
        return self.assistant_message_repository.get_paginated(page, limit)

    def get_stats(self):
        total_users_messages = self.user_message_repository.count()
        total_assistants = self.assistant_message_repository.count()
        models = (
            self.user_message_repository.get_models_used()
            + self.assistant_message_repository.get_models_used()
        )
        unique_models = list(set(models))

        self.logger.info(
            f"Total users messages: {total_users_messages}, Total assistants: {total_assistants}, Models used: {unique_models}"
        )

        return {
            # "total_conversations": total_users_messages,
            "total_messages": total_users_messages + total_assistants,
            "models_used": unique_models,
        }

    def delete_message(self, message_id: int, role: str):
        if role not in ["user", "assistant"]:
            raise HTTPException(status_code=400, detail="Invalid role")

        if role == "user":
            deleted = self.user_message_repository.delete(message_id)
        elif role == "assistant":
            deleted = self.assistant_message_repository.delete(message_id)

        if not deleted:
            raise HTTPException(status_code=404, detail="Message not found")

        return {"status": "deleted", "role": role, "id": message_id}
