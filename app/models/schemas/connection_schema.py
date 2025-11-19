from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class Connection(SQLModel, table=True):

    id: int | None = Field(default=None, primary_key=True)

    host: str = Field(nullable=False)
    port: int = Field(nullable=False)
    user: str = Field(nullable=False)
    password: str = Field(nullable=False)
    database: str = Field(nullable=False)
    name: Optional[str] = Field(default=None, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
