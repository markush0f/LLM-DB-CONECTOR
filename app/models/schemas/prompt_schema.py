from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class UserMessage(SQLModel, table=True):
    """Stores user prompts."""

    id: int | None = Field(default=None, primary_key=True)
    content: str
    model_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AssistantMessage(SQLModel, table=True):
    """Stores assistant responses linked to a user message."""

    id: int | None = Field(default=None, primary_key=True)

    content: str
    model_name: str
    role: str = "assistant"

    user_message_id: int | None = Field(default=None, foreign_key="usermessage.id")

    created_at: datetime = Field(default_factory=datetime.utcnow)
