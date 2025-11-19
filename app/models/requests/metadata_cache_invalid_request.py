from typing import Optional
from pydantic import BaseModel, Field


class MetadataCacheInvalidateRequest(BaseModel):
    schema_name: Optional[str] = Field(None, alias="schema")
    table_name: Optional[str] = Field(None, alias="table")

    class Config:
        populate_by_name = True  
