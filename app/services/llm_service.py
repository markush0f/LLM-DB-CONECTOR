import os
import subprocess
import time
from app.core.logger import create_logger


os.environ["OLLAMA_NO_ANSI"] = "1"
os.environ["TERM"] = "dumb"
os.environ["NO_COLOR"] = "1"
os.environ["RICH_NO_COLOR"] = "1"
os.environ["RICH_PROGRESS_BAR"] = "0"
os.environ["PYTHONUNBUFFERED"] = "1"


class LocalLLMConnector:
    logger = create_logger()

    def __init__(
        self,
        model_name: str,
        temperature: float = 0.2,
        top_p: float = 1.0,
        seed: int | None = None,
        max_tokens: int = 2048,
        timeout: int = 60,
        use_gpu: bool = True,
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.top_p = top_p
        self.seed = seed
        self.max_tokens = max_tokens
        self.timeout = timeout

    def clean_output(self, text: str) -> str:
        remove_list = [
            "\x1b",
            "\u001b",
            "[?25l",
            "[?25h",
            "[?2026h",
            "[?2026l",
            "[K",
            "[1G",
            "⠙",
            "⠸",
            "⠼",
            "⠴",
            "⠦",
            "⠧",
            "⠇",
            "⠏",
            "⠋",
            "⠹",
        ]

        for p in remove_list:
            text = text.replace(p, "")

        return text.strip()

    def run_text(
        self, user_prompt: str, system_prompt: str = "", context: str = ""
    ) -> str:
        final_prompt = ""

        if system_prompt:
            final_prompt += system_prompt.strip() + "\n\n"

        if context:
            final_prompt += context.strip() + "\n\n"

        final_prompt += user_prompt

        cmd = [
            "ollama",
            "run",
            self.model_name,
            "--temperature",
            str(self.temperature),
            "--top-p",
            str(self.top_p),
        ]

        if self.seed is not None:
            cmd.extend(["--seed", str(self.seed)])

        try:
            start = time.time()

            result = subprocess.run(
                cmd,
                input=final_prompt.encode("utf-8"),
                capture_output=True,
                timeout=self.timeout,
            )

            elapsed = (time.time() - start) * 1000
            self.logger.info("LLM execution time: %.2f ms", elapsed)

            stdout = self.clean_output(result.stdout.decode("utf-8"))
            stderr = self.clean_output(result.stderr.decode("utf-8"))

            return (stdout + "\n" + stderr).strip()

        except subprocess.TimeoutExpired:
            return "ERROR: TIMEOUT"

        except Exception as e:
            return f"ERROR: {str(e)}"
