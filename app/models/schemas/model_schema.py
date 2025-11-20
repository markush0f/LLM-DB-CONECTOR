from sqlmodel import SQLModel, Field
from datetime import datetime


class Model(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)

    model_name: str = Field(index=True, unique=True)

    system_prompt: str
    context: str

    temperature: float = 0.2
    top_p: float = 1.0
    seed: int | None = None

    updated_at: datetime = Field(default_factory=datetime.utcnow)
