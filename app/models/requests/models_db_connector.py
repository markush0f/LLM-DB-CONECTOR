from typing import Optional
from pydantic import BaseModel


class PGDBConnector(BaseModel):
    host: str
    port: int
    user: str
    password: str
    database: str
    name: Optional[str] = None
