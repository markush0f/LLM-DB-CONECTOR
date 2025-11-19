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

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "host": self.host,
            "port": self.port,
            "user": self.user,
            "database": self.database,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
