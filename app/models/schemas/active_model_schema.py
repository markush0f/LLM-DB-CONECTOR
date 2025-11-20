from sqlmodel import SQLModel, Field


class ActiveModel(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    model_id: int = Field(foreign_key="model.id", unique=True)
