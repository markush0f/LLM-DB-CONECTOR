import json
from app.core.logger import create_logger


class PromptBuilder:
    def __init__(self, tools):
        self.logger = create_logger()
        self.tools = tools

    def build(self, system_prompt: str, context: str, user_input: str) -> str:
        return f"""{system_prompt}

    TOOLS:
    {json.dumps({"tools": self.tools}, indent=2)}

    CONTEXT:
    {context}

    USER_INPUT:
    {user_input}

    ### FINAL RULES (MANDATORY)
    You MUST start your response with a TOOL_CALL to "list_schemas".
    Return ONLY JSON and ONLY the structures defined in the SYSTEM_PROMPT.
    """
