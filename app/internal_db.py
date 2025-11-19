import os
from datetime import datetime
from sqlmodel import SQLModel, Field, create_engine, Session
from pathlib import Path


# Database path
DB_PATH = Path(os.getcwd()) / "app_data_sql.db"

# SQLModel engine
engine = create_engine(
    f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False}, echo=False
)


class Connection(SQLModel, table=True):
    """Stores user-defined database connections."""

    __tablename__ = "connections"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, index=True)
    host: str = Field(nullable=False)
    port: int = Field(nullable=False)
    user: str = Field(nullable=False)
    database: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "host": self.host,
            "port": self.port,
            "user": self.user,
            "database": self.database,
            "created_at": self.created_at.isoformat(),
        }


def get_local_session() -> Session:
    """Return a new SQLModel session."""
    return Session(engine)


def init_internal_db():
    """Initialize SQLite database if not already created."""
    SQLModel.metadata.create_all(engine)
    print(f"Internal SQLite database ready at: {DB_PATH}")
