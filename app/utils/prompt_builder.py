import json
from app.core.logger import create_logger


class PromptBuilder:
    def __init__(self, tools):
        self.logger = create_logger()
        self.tools = tools

    def build(
        self,
        system_prompt: str,
        context: str,
        user_input: str,
        last_tool_result: dict | None,
        step: int,
        last_tool_name: str | None,
    ) -> str:
        """CHANGE: prompt now encodes state and last tool result in JSON-friendly form."""

        state = {
            "step": step,
            "last_tool_name": last_tool_name,
            "has_last_tool_result": last_tool_result is not None,
        }

        if last_tool_result is not None:
            last_result_json = json.dumps(last_tool_result)
        else:
            last_result_json = "null"

        return f"""{system_prompt}

CONTEXT:
{context}

TOOLS:
{json.dumps({"tools": self.tools}, indent=2)}

STATE:
{json.dumps(state, indent=2)}

LAST_TOOL_RESULT_JSON:
{last_result_json}

USER_INPUT:
{user_input}

Follow strictly the TOOL_CALL and FINAL_SQL JSON formats defined in the system prompt.
Do not output markdown or any text outside a single JSON object.
"""
