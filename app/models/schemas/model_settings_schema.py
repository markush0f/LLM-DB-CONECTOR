from sqlmodel import SQLModel, Field


class ModelSettings(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    model_name: str
    system_prompt: str
    temperature: float = 0.2
    top_p: float = 1.0
    seed: int | None = None
