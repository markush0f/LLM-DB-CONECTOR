from sqlmodel import SQLModel, Field
from datetime import datetime


class PromptHistory(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_input: str
    model_output: str
    model_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
