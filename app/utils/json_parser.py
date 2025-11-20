import json
import re


class JSONParser:

    def clean_output(self, text: str) -> str:
        text = re.sub(r"\x1b\[[0-9;]*[A-Za-z]", "", text)
        text = re.sub(r"[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]", "", text)
        text = re.sub(r"\[\?2004[hl]", "", text)
        text = text.replace("[2K", "")
        text = text.replace("```json", "").replace("```", "")
        return text.strip()

    def extract_block(self, text: str, marker: str):
        # FIX: allow TOOL_CALL     {
        pattern = rf"{marker}\s*{{"
        match = re.search(pattern, text)
        if not match:
            return None
        return text[match.end() - 1 :].strip()

    def safe_parse(self, text: str):
        text = text.replace("```json", "").replace("```", "")

        # FIX: unescape quotes
        text = text.replace('\\"', '"')

        text = re.sub(r"//.*", "", text)

        start = text.find("{")
        end = text.rfind("}")

        if start == -1 or end == -1 or end <= start:
            return None

        raw = text[start : end + 1].strip()

        try:
            return json.loads(raw)
        except:
            pass

        repaired = re.sub(r",\s*}", "}", raw)
        repaired = re.sub(r",\s*]", "]", repaired)

        try:
            return json.loads(repaired)
        except:
            return None

    def parse_final_sql(self, text: str):

        parsed = self.safe_parse(text)

        if isinstance(parsed, dict) and "sql" in parsed and "explanation" in parsed:
            return parsed

        text = text.replace("```json", "").replace("```", "")

        sql_value_match = re.search(
            r'"sql"\s*:\s*((?:"[^"]*"\s*\+\s*)*"[^"]*")',
            text,
            re.DOTALL,
        )
        if not sql_value_match:
            return None

        sql_group = sql_value_match.group(1)
        parts = re.findall(r'"([^"]*)"', sql_group)
        sql_value = "".join(parts)

        explanation_match = re.search(
            r'"explanation"\s*:\s*"([^"]*)"',
            text,
            re.DOTALL,
        )
        if not explanation_match:
            return None

        explanation_value = explanation_match.group(1)

        return {
            "sql": sql_value,
            "explanation": explanation_value,
        }
