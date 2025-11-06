from sqlalchemy import text
from pathlib import Path
from collections import defaultdict
from app.services.db_session import db_session


class SchemaService:
    """Handles schema extraction and grouping for the active PostgreSQL database."""

    def __init__(self):
        if not db_session.is_connected():
            raise ConnectionError("No active database connection.")
        self.engine = db_session.engine
        self.base_path = Path(__file__).resolve().parent.parent / "common" / "sql"


    def _load_sql(self, filename: str) -> str:
        """Reads and returns a .sql file from the common/sql directory."""
        path = self.base_path / filename
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def _fetch_columns(self, conn) -> list[dict]:
        """Fetches all table columns from the active database."""
        query = text(self._load_sql("columns.sql"))
        return [dict(row._mapping) for row in conn.execute(query)]

    def _fetch_primary_keys(self, conn) -> list[dict]:
        """Fetches all primary keys."""
        query = text(self._load_sql("primary_keys.sql"))
        return [dict(row._mapping) for row in conn.execute(query)]

    def _fetch_foreign_keys(self, conn) -> list[dict]:
        """Fetches all foreign key relationships."""
        query = text(self._load_sql("foreign_keys.sql"))
        return [dict(row._mapping) for row in conn.execute(query)]

    def _group_schema(self, columns, pks, fks) -> dict:
        """Groups raw SQL metadata into structured schema by table."""
        schema = defaultdict(lambda: {"columns": [], "primary_keys": [], "foreign_keys": []})

        # Columns
        for col in columns:
            table_key = f"{col['table_schema']}.{col['table_name']}"
            schema[table_key]["columns"].append({
                "name": col["column_name"],
                "type": col["data_type"],
                "nullable": col["is_nullable"],
                "default": col["column_default"],
            })

        # Primary keys
        for pk in pks:
            table_key = f"{pk['table_schema']}.{pk['table_name']}"
            schema[table_key]["primary_keys"].append(pk["column_name"])

        # Foreign keys
        for fk in fks:
            table_key = f"{fk['table_schema']}.{fk['table_name']}"
            schema[table_key]["foreign_keys"].append({
                "column": fk["column_name"],
                "ref_table": fk["foreign_table_name"],
                "ref_column": fk["foreign_column_name"],
            })

        return schema


    def get_schema_grouped(self) -> dict:
        """Extracts and returns the database schema grouped by table."""
        with self.engine.connect() as conn:
            columns = self._fetch_columns(conn)
            pks = self._fetch_primary_keys(conn)
            fks = self._fetch_foreign_keys(conn)

        return self._group_schema(columns, pks, fks)
