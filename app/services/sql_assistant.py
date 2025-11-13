import os
import json
from app.services.llm_service import LocalLLMConnector


class SQLAssistantService:
    def __init__(self):
        self.tools = self.load_tools()
        self.llm = LocalLLMConnector(model_name="mistral:7b-instruct", use_gpu=True)

    def load_tools(self):
        """
        Loads sql_tools.json from app/common/tools/sql_tools.json
        """

        # Current file: /app/services/sql_assistant.py
        current_dir = os.path.dirname(__file__)

        tools_path = os.path.abspath(
            os.path.join(
                current_dir,  # /app/services
                "..",  # /app
                "common",  # /app/common
                "tools",  # /app/common/tools
                "sql_tools.json",
            )
        )

        if not os.path.exists(tools_path):
            print(f"sql_tools.json NOT FOUND at {tools_path}")
            return []

        try:
            with open(tools_path, "r", encoding="utf-8") as f:
                tools = json.load(f)
                print(f"Loaded {len(tools)} SQL tools from {tools_path}")
                return tools
        except Exception as e:
            print(f"Error loading sql_tools.json: {e}")
            return []

    def build_prompt_db_context(self):
        """
        Returns tools in formatted JSON for embedding in LLM prompt.
        """
        return json.dumps(self.tools, indent=2)
