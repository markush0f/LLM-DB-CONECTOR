from sqlmodel import SQLModel, Field
from datetime import datetime


class SystemMetrics(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    total_connections: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)
