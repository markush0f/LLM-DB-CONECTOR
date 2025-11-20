from pydantic import BaseModel
from typing import Optional


class UpdateModelSettingsRequest(BaseModel):
    model_name: Optional[str] = None
    system_prompt: Optional[str] = None
    context: Optional[str] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    seed: Optional[int] = None
