import os
import subprocess
from typing import List, Dict


class LocalLLMConnector:
    """
    Minimal local LLM connector.
    - Build raw prompts (strings)
    - Send them to the model through Ollama
    - Return the raw output
    """

    def __init__(
        self,
        model_name: str = "mistral:7b-instruct",
        temperature: float = 0.2,
        max_tokens: int = 2048,
        timeout: int = 60,
        use_gpu: bool = True,
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.timeout = timeout
        self.use_gpu = use_gpu

        # OLLAMA config
        os.environ["OLLAMA_NUM_THREAD"] = "8"
        os.environ["OLLAMA_MAX_LOADED_MODELS"] = "1"
        os.environ["OLLAMA_USE_GPU"] = "1" if use_gpu else "0"

    def build_prompt(self, messages: List[Dict[str, str]]) -> str:
        """
        Converts a list of messages into a plain chat-style prompt.
        """
        prompt = ""
        for msg in messages:
            role = msg["role"].upper()
            content = msg["content"]
            prompt += f"{role}: {content}\n"
        return prompt

    def run_raw(self, messages: List[Dict[str, str]]) -> str:
        prompt = self.build_prompt(messages)

        result = subprocess.run(
            ["ollama", "run", self.model_name],
            input=prompt.encode("utf-8"),
            capture_output=True,
            timeout=self.timeout,
        )

        output = (result.stdout + result.stderr).decode("utf-8", errors="ignore")
        return output.strip()
    
    def run_text(self, text: str) -> str:
        messages = [{"role": "user", "content": text}]
        return self.run_raw(messages)
