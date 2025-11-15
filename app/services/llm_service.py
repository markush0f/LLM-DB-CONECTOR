import os
import subprocess
import time
from typing import List, Dict
from app.core.logger import create_logger


# Disable all ANSI output, spinners and TTY behavior from Ollama
os.environ["OLLAMA_NO_ANSI"] = "1"
os.environ["TERM"] = "dumb"
os.environ["NO_COLOR"] = "1"
os.environ["RICH_NO_COLOR"] = "1"
os.environ["RICH_PROGRESS_BAR"] = "0"
os.environ["PYTHONUNBUFFERED"] = "1"


class LocalLLMConnector:
    """
    Minimal local LLM connector responsible for:
    - Building raw prompts
    - Executing the model via subprocess
    - Cleaning the output from any ANSI, spinner or cursor control sequences
    """

    logger = create_logger()

    def __init__(
        self,
        model_name: str = "qwen2.5-coder:14b",
        temperature: float = 0.2,
        max_tokens: int = 2048,
        timeout: int = 60,
        use_gpu: bool = True,
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.timeout = timeout

        os.environ["OLLAMA_USE_GPU"] = "1" if use_gpu else "0"
        os.environ["OLLAMA_NUM_THREAD"] = "8"
        os.environ["OLLAMA_MAX_LOADED_MODELS"] = "1"

    def clean_output(self, text: str) -> str:
        """
        Cleans any ANSI codes, spinner sequences or terminal control patterns
        produced by Ollama. This is required for JSON parsing.
        """

        remove_list = [
            "\x1b",  # ESC code
            "\u001b",  # ESC unicode
            "[?25l",  # hide cursor
            "[?25h",  # show cursor
            "[?2026h",  # terminal mode
            "[?2026l",  # terminal mode
            "[K",  # clear-to-end
            "[1G",  # move cursor to column 1
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

        cleaned = text
        for pattern in remove_list:
            cleaned = cleaned.replace(pattern, "")

        return cleaned.strip()

    def run_text(self, prompt: str) -> str:
        try:
            self.logger.info("Running LLM with prompt (%d chars)", len(prompt))
            # self.logger.debug(
            #     "----- LLM PROMPT BEGIN -----\n%s\n----- LLM PROMPT END -----", prompt
            # )

            start = time.time()

            result = subprocess.run(
                ["ollama", "run", self.model_name],
                input=prompt.encode("utf-8"),
                capture_output=True,
                timeout=self.timeout,
            )

            elapsed = (time.time() - start) * 1000
            self.logger.info("LLM execution time: %.2f ms", elapsed)

            stdout = result.stdout.decode("utf-8", errors="ignore")
            stderr = result.stderr.decode("utf-8", errors="ignore")

            self.logger.debug("----- RAW STDOUT -----\n%s", stdout)
            self.logger.debug("----- RAW STDERR -----\n%s", stderr)

            # Clean output from any spinner / ANSI / cursor control
            clean_stdout = self.clean_output(stdout)
            clean_stderr = self.clean_output(stderr)

            if result.returncode != 0:
                self.logger.error("LLM returned exit code: %s", result.returncode)

            # Merge cleaned outputs
            final_output = (clean_stdout + "\n" + clean_stderr).strip()
            self.logger.debug("----- CLEANED MODEL OUTPUT -----\n%s", final_output)

            return final_output

        except subprocess.TimeoutExpired:
            self.logger.error("LLM timed out after %d seconds", self.timeout)
            return "ERROR: TIMEOUT"

        except Exception as e:
            self.logger.error("LLM error: %s", str(e))
            return f"ERROR: {str(e)}"
