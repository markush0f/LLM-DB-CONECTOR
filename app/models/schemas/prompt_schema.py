from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime


class Prompt(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_input: str
    model_output: str
    model_name: str
    role: str
    parent_id: Optional[int] = Field(default=None, foreign_key="prompt.id")

    created_at: datetime = Field(default_factory=datetime.utcnow)
