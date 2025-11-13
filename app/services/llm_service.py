import os
import subprocess
from typing import Optional, Dict, Any
import re
import json


class LocalLLMConnector:
    """
    LocalLLMConnector runs a local LLM model through Ollama CLI using subprocess.

    It transforms user instructions into SQL commands or other outputs
    by sending formatted prompts directly to the model installed on your system.
    """

    def __init__(
        self,
        model_name: str = "mistral:7b-instruct",
        temperature: float = 0.2,
        max_tokens: int = 1024,
        format_json: bool = True,
        timeout: int = 60,
        use_gpu: bool = True,
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.format_json = format_json
        self.timeout = timeout
        self.use_gpu = use_gpu

        # 🔧 Configura el entorno para Ollama
        os.environ["OLLAMA_NUM_THREAD"] = "8"
        os.environ["OLLAMA_MAX_LOADED_MODELS"] = "1"

        if self.use_gpu:
            os.environ["OLLAMA_USE_GPU"] = "1"
            os.environ["OLLAMA_KV_CACHE_TYPE"] = "cuda"
        else:
            os.environ["OLLAMA_USE_GPU"] = "0"
            os.environ["OLLAMA_KV_CACHE_TYPE"] = "cpu"

        print(f"🚀 Initialized LLM: {self.model_name} | GPU={'ON' if self.use_gpu else 'OFF'}")

    
    
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
        Runs the local LLM model via Ollama CLI and extracts JSON even if surrounded by extra text.
        """
        prompt = self.build_prompt(user_input)

        try:
            # Ejecutar Ollama
            result = subprocess.run(
                ["ollama", "run", self.model_name],
                input=prompt.encode("utf-8"),
                capture_output=True,
                timeout=self.timeout,
            )

            # Combinar salida estándar y errores
            output = (result.stdout + result.stderr).decode("utf-8", errors="ignore").strip()

            # Si Ollama falla
            if result.returncode != 0:
                return {"error": f"Ollama failed: {output}"}

            # Intentar aislar un bloque JSON en la respuesta
            json_match = re.search(r"\{[\s\S]*\}", output)
            if json_match:
                try:
                    parsed = json.loads(json_match.group(0))
                    return parsed
                except json.JSONDecodeError:
                    pass  # Fallback si el JSON está roto

            # Si no se encuentra JSON válido
            return {"sql": None, "explanation": output}

        except subprocess.TimeoutExpired:
            return {"error": f"Model timed out after {self.timeout}s"}
        except FileNotFoundError:
            return {"error": "Ollama not found in PATH"}
        except Exception as e:
            return {"error": str(e)}
