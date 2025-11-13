from sqlalchemy import text
from pathlib import Path
from collections import defaultdict
from app.services.db_session import db_session


class SchemaService:
    """Handles schema extraction and grouping for PostgreSQL."""

    def __init__(self):
        if not db_session.is_connected():
            raise ConnectionError("No active database connection.")
        self.engine = db_session.engine
        self.base_path = Path(__file__).resolve().parent.parent / "common" / "sql"

    # ---------------------------------------------------------
    # Core loader for any SQL file (public + reusable)
    # ---------------------------------------------------------
    def load_sql(self, filename: str) -> str:
        path = self.base_path / filename
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    # ---------------------------------------------------------
    # PUBLIC RAW FETCHERS (no more private _fetch_)
    # These return raw DB data ready to be processed
    # ---------------------------------------------------------
    def fetch_columns(self, schema_name: str | None = None):
        query = text(self.load_sql("columns.sql"))
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema_name": schema_name})
            return [dict(row._mapping) for row in result]

    def fetch_primary_keys(self, schema_name: str | None = None):
        query = text(self.load_sql("primary_keys.sql"))
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema_name": schema_name})
            return [dict(row._mapping) for row in result]

    def fetch_foreign_keys(self, schema_name: str | None = None):
        query = text(self.load_sql("foreign_keys.sql"))
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema_name": schema_name})
            return [dict(row._mapping) for row in result]

    # ---------------------------------------------------------
    # PROCESSED PUBLIC API
    # ---------------------------------------------------------
    def get_schemas(self):
        query = text(
            """
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name NOT LIKE 'pg_%'
            AND schema_name NOT IN ('information_schema')
            ORDER BY schema_name;
        """
        )
        with self.engine.connect() as conn:
            result = conn.execute(query)
            return [row[0] for row in result.fetchall()]

    def get_table_names(self, schema_name: str = "public") -> list[str]:
        query = text(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = :schema_name
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """
        )
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema_name": schema_name})
            return [row[0] for row in result.fetchall()]

    # ---------------------------------------------------------
    # TABLE-SPECIFIC CLEAN RESULTS
    # ---------------------------------------------------------
    def get_primary_keys(self, schema_name: str, table_name: str) -> list[str]:
        pks = self.fetch_primary_keys(schema_name)
        return [pk["column_name"] for pk in pks if pk["table_name"] == table_name]

    def get_foreign_keys(self, schema_name: str, table_name: str) -> list[dict]:
        fks = self.fetch_foreign_keys(schema_name)
        return [
            {
                "column": fk["column_name"],
                "ref_table": fk["foreign_table_name"],
                "ref_column": fk["foreign_column_name"],
            }
            for fk in fks
            if fk["table_name"] == table_name
        ]

    def get_table_columns(self, table_name: str, schema_name: str = "public"):
        query = text(self.load_sql("table_columns.sql"))
        with self.engine.connect() as conn:
            raw = conn.execute(
                query, {"schema_name": schema_name, "table_name": table_name}
            )
            return [dict(row._mapping) for row in raw]

    # ---------------------------------------------------------
    # Combined table description (for agent tools)
    # ---------------------------------------------------------
    def describe_table(self, schema_name: str, table_name: str) -> dict:
        return {
            "schema": schema_name,
            "table": table_name,
            "columns": self.get_table_columns(table_name, schema_name),
            "primary_keys": self.get_primary_keys(schema_name, table_name),
            "foreign_keys": self.get_foreign_keys(schema_name, table_name),
        }

    # ---------------------------------------------------------
    # Grouped schema (for diagram)
    # ---------------------------------------------------------
    def get_schema_grouped(self, schema_name: str | None = None) -> dict:
        columns = self.fetch_columns(schema_name)
        pks = self.fetch_primary_keys(schema_name)
        fks = self.fetch_foreign_keys(schema_name)

        schema = defaultdict(
            lambda: {"columns": [], "primary_keys": [], "foreign_keys": []}
        )

        for col in columns:
            key = f"{col['table_schema']}.{col['table_name']}"
            schema[key]["columns"].append(
                {
                    "name": col["column_name"],
                    "type": col["data_type"],
                    "nullable": col["is_nullable"],
                    "default": col["column_default"],
                }
            )

        for pk in pks:
            key = f"{pk['table_schema']}.{pk['table_name']}"
            schema[key]["primary_keys"].append(pk["column_name"])

        for fk in fks:
            key = f"{fk['table_schema']}.{fk['table_name']}"
            schema[key]["foreign_keys"].append(
                {
                    "column": fk["column_name"],
                    "ref_table": fk["foreign_table_name"],
                    "ref_column": fk["foreign_column_name"],
                }
            )

        return schema
