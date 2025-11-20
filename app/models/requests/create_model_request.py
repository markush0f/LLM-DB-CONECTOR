from pydantic import BaseModel


class CreateModelRequest(BaseModel):
    model_name: str
    system_prompt: str = "" 
    context: str = ""
    temperature: float = 0.2
    top_p: float = 1.0
    seed: int | None = None
