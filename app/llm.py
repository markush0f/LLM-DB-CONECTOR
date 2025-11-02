import subprocess
import json
from typing import Optional, Dict, Any


class LocalLLMConnector:
    """
    LocalLLMConnector runs a local LLM model through Ollama CLI using subprocess.

    It transforms user instructions into SQL commands or other outputs
    by sending formatted prompts directly to the model installed on your system.

    Example:
        llm = LocalLLMConnector(model_name="deepseek-r1", temperature=0.1)
        response = llm.run("Create a SQL table for products with id, name, and price")
    """

    def __init__(
        self,
        model_name: str = "deepseek-r1",
        temperature: float = 0.2,
        max_tokens: int = 1024,
        format_json: bool = True,
        timeout: int = 60,
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.format_json = format_json
        self.timeout = timeout

    def build_prompt(self, user_input: str) -> str:
        """
        Builds a structured prompt for the model.
        """
        return f"""
        You are an expert SQL database assistant.
        Convert the following natural language instruction into valid SQL.

        Respond ONLY in JSON with two fields:
        {{
            "sql": "the generated SQL code",
            "explanation": "brief explanation of what it does"
        }}

        Instruction:
        {user_input}
        """

    def run(self, user_input: str) -> Dict[str, Any]:
        """
        Runs the local LLM model via Ollama CLI and returns structured output.
        Compatible with older Ollama versions (no --no-stream flag).
        """
        prompt = self.build_prompt(user_input)

        try:
            # Run Ollama CLI (simplest possible call)
            result = subprocess.run(
                ["ollama", "run", self.model_name, prompt],
                capture_output=True,
                text=True,
                timeout=self.timeout,
            )

            # Merge stdout and stderr in case the model prints there
            output = (result.stdout + result.stderr).strip()
            print(f"Model output:\n{output}")

            if result.returncode != 0:
                return {"error": f"Ollama failed: {output}"}

            # Try to parse JSON
            if self.format_json:
                try:
                    return json.loads(output)
                except json.JSONDecodeError:
                    # Model did not return valid JSON
                    return {"sql": None, "explanation": output}

            return {"raw_output": output}

        except subprocess.TimeoutExpired:
            return {"error": f"Model execution timed out after {self.timeout}s."}
        except FileNotFoundError:
            return {"error": "Ollama executable not found. Ensure it's installed and in PATH."}
        except Exception as e:
            return {"error": str(e)}

