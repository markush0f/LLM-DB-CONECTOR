from sqlalchemy import text
from pathlib import Path
from app.services.db_session import db_session

class SchemaService:
    """
    Extracts database schema using the active connection managed by DBSessionManager.
    """

    def __init__(self):
        if not db_session.is_connected():
            raise ConnectionError("No active database connection.")
        self.engine = db_session.engine
        self.base_path = Path(__file__).resolve().parent.parent / "common" / "sql"

    def _load_sql(self, filename: str):
        path = self.base_path / filename
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def get_schema(self):
        """Returns tables, columns, PKs and FKs for the active DB."""
        with self.engine.connect() as conn:
            columns = [dict(r._mapping) for r in conn.execute(text(self._load_sql("columns.sql")))]
            pks = [dict(r._mapping) for r in conn.execute(text(self._load_sql("primary_keys.sql")))]
            fks = [dict(r._mapping) for r in conn.execute(text(self._load_sql("foreign_keys.sql")))]

        return {
            "columns": columns,
            "primary_keys": pks,
            "foreign_keys": fks,
        }
