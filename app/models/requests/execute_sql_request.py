from pydantic import BaseModel


class ExecuteRequest(BaseModel):
    sql: str