from typing import Optional
from pydantic import BaseModel


class MetadataCacheInvalidateRequest(BaseModel):
    schema: Optional[str] = None
    table: Optional[str] = None
