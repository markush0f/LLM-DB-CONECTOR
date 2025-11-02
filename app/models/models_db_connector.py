from pydantic import BaseModel

class PGDBConnector(BaseModel):
    host: str
    port: int
    user: str
    password: str
    database: str
