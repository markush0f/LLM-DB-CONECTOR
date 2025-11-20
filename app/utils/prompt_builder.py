class PromptBuilder:
    """
    Builds the full prompt including:
    - system prompt
    - context prompt
    - previous messages (tool + assistant)
    - new user input
    """

    def __init__(self, tools: dict):
        self.tools = tools

    def build(
        self, user_input: str, messages: list, system_prompt: str, context: str
    ) -> str:
        """
        Build the full structured prompt for the LLM.
        """

        tool_desc = self._format_tools()

        prompt_sections = [
            f"### SYSTEM_PROMPT:\n{system_prompt}\n",
            f"### CONTEXT:\n{context}\n",
            f"### AVAILABLE_TOOLS:\n{tool_desc}\n",
            "### CONVERSATION_HISTORY:\n",
        ]

        for msg in messages:
            role = msg["role"]
            content = msg["content"]

            if role == "tool":
                prompt_sections.append(f"[TOOL_RESPONSE] {content}\n")
            else:
                prompt_sections.append(f"[{role.upper()}] {content}\n")

        prompt_sections.append(f"### USER_INPUT:\n{user_input}\n")

        prompt_sections.append(
            "### INSTRUCTION:\n"
            "Follow SYSTEM_PROMPT rules strictly. "
            "Respond ONLY using TOOL_CALL or FINAL_SQL JSON blocks."
        )

        return "\n".join(prompt_sections)

    def _format_tools(self):
        """Format tool definitions into human-readable JSON-like text."""
        return "\n".join(
            [f"- {name}: {details}" for name, details in self.tools.items()]
        )
