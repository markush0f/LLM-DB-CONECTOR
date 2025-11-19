import json
from app.common.system_prompt import SYSTEM_PROMPT


class PromptBuilder:
    def __init__(self, tools: dict):
        self.tools_json = json.dumps(tools, indent=2)

    def build(self, user_input: str, messages: list) -> str:
        system_block = SYSTEM_PROMPT + "\nTOOLS:\n" + self.tools_json + "\n"
        prompt = system_block + f"USER:\n{user_input}\n"

        for m in messages:
            role = m["role"]
            content = m["content"]

            if role == "assistant":
                prompt += f"ASSISTANT:\n{content}\n"
            elif role == "tool":
                prompt += f"TOOL_RESPONSE:\n{content}\n"

        return prompt
