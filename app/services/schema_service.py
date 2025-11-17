from sqlalchemy import text
from pathlib import Path
from collections import defaultdict
from app.core.logger import create_logger
from app.services.database_service import db_session


class SchemaService:
    """Handles schema extraction and grouping for PostgreSQL."""

    logger = create_logger()

    def __init__(self):
        # CHANGE: do not check DB connection on init
        self.engine = None
        self.base_path = Path(__file__).resolve().parent.parent / "common" / "sql"

    # CHANGE: validate connection only when needed
    def _ensure_connected(self):
        if not db_session.is_connected():
            raise ConnectionError("No active database connection.")
        self.engine = db_session.engine

    def load_sql(self, filename: str) -> str:
        path = self.base_path / filename
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        self.logger.debug("load_sql result for %s: %s", filename, content)
        return content

    def fetch_columns(self, schema_name: str | None = None):
        self._ensure_connected()
        query = text(self.load_sql("columns.sql"))
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema_name": schema_name})
            rows = [dict(row._mapping) for row in result]
        self.logger.debug("fetch_columns result for schema=%s: %s", schema_name, rows)
        return rows

    def fetch_primary_keys(self, schema_name: str | None = None):
        self._ensure_connected()
        query = text(self.load_sql("primary_keys.sql"))
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema_name": schema_name})
            rows = [dict(row._mapping) for row in result]
        self.logger.debug(
            "fetch_primary_keys result for schema=%s: %s", schema_name, rows
        )
        return rows

    def fetch_foreign_keys(self, schema_name: str | None = None):
        self._ensure_connected()
        query = text(self.load_sql("foreign_keys.sql"))
        with self.engine.connect() as conn:
            result = conn.execute(query, {"schema_name": schema_name})
            rows = [dict(row._mapping) for row in result]
        self.logger.debug(
            "fetch_foreign_keys result for schema=%s: %s", schema_name, rows
        )
        return rows

    def get_schemas(self):
        self._ensure_connected()
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
            schemas = [row[0] for row in result.fetchall()]
        self.logger.debug("get_schemas result: %s", schemas)
        return schemas

    def get_table_names(self, schema_name: str = "public") -> list[str]:
        self._ensure_connected()
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
            tables = [row[0] for row in result.fetchall()]
        self.logger.debug(
            "get_table_names result for schema=%s: %s", schema_name, tables
        )
        return tables

    def get_primary_keys(self, schema_name: str, table_name: str) -> list[str]:
        pks = self.fetch_primary_keys(schema_name)
        result = [pk["column_name"] for pk in pks if pk["table_name"] == table_name]
        self.logger.debug(
            "get_primary_keys result for %s.%s: %s", schema_name, table_name, result
        )
        return result

    def get_foreign_keys(self, schema_name: str, table_name: str) -> list[dict]:
        fks = self.fetch_foreign_keys(schema_name)
        result = [
            {
                "column": fk["column_name"],
                "ref_table": fk["foreign_table_name"],
                "ref_column": fk["foreign_column_name"],
            }
            for fk in fks
            if fk["table_name"] == table_name
        ]
        self.logger.debug(
            "get_foreign_keys result for %s.%s: %s", schema_name, table_name, result
        )
        return result

    def get_table_columns(self, table_name: str, schema_name: str = "public"):
        self._ensure_connected()
        query = text(self.load_sql("table_columns.sql"))
        with self.engine.connect() as conn:
            raw = conn.execute(
                query, {"schema_name": schema_name, "table_name": table_name}
            )
            columns = [dict(row._mapping) for row in raw]
        self.logger.debug(
            "get_table_columns result for %s.%s: %s", schema_name, table_name, columns
        )
        return columns

    def describe_table(self, schema_name: str, table_name: str) -> dict:
        self._ensure_connected()
        desc = {
            "schema": schema_name,
            "table": table_name,
            "columns": self.get_table_columns(table_name, schema_name),
            "primary_keys": self.get_primary_keys(schema_name, table_name),
            "foreign_keys": self.get_foreign_keys(schema_name, table_name),
        }
        self.logger.debug(
            "describe_table result for %s.%s: %s", schema_name, table_name, desc
        )
        return desc

    def get_schema_grouped(self, schema_name: str | None = None) -> dict:
        self._ensure_connected()
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

        self.logger.debug(
            "get_schema_grouped result for schema=%s: %s", schema_name, schema
        )
        return schema
