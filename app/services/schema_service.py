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

    def _fetch_columns(self, conn, schema_name: str | None = None) -> list[dict]:
        """Fetches all table columns from the active database."""
        query = self._load_sql("columns.sql")
        if schema_name:
            # Filtrar schema directamente en la query
            query += " WHERE table_schema = :schema_name"
        result = conn.execute(
            text(query), {"schema_name": schema_name} if schema_name else {}
        )
        return [dict(row._mapping) for row in result]

    def _fetch_primary_keys(self, conn, schema_name: str | None = None) -> list[dict]:
        """Fetches all primary keys."""
        query = self._load_sql("primary_keys.sql")
        if schema_name:
            query += " AND kcu.table_schema = :schema_name"
        result = conn.execute(
            text(query), {"schema_name": schema_name} if schema_name else {}
        )
        return [dict(row._mapping) for row in result]

    def _fetch_foreign_keys(self, conn, schema_name: str | None = None) -> list[dict]:
        """Fetches all foreign key relationships."""
        query = self._load_sql("foreign_keys.sql")
        if schema_name:
            query += " AND kcu.table_schema = :schema_name"
        result = conn.execute(
            text(query), {"schema_name": schema_name} if schema_name else {}
        )
        return [dict(row._mapping) for row in result]
    
    def _group_schema(self, columns, pks, fks) -> dict:
        """Groups raw SQL metadata into structured schema by table."""
        schema = defaultdict(
            lambda: {"columns": [], "primary_keys": [], "foreign_keys": []}
        )

        # Columns
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

        # Primary keys
        for pk in pks:
            key = f"{pk['table_schema']}.{pk['table_name']}"
            schema[key]["primary_keys"].append(pk["column_name"])

        # Foreign keys
        for fk in fks:
            key = f"{fk['table_schema']}.{fk['table_name']}"
            schema[key]["foreign_keys"].append(
                {
                    "column": fk["column_name"],
                    "ref_table": f"{fk['foreign_table_name']}",
                    "ref_column": fk["foreign_column_name"],
                }
            )

        return schema

    def get_schema_grouped(self, schema_name: str | None = None) -> dict:
        """
        Extracts and returns the database schema grouped by table.
        Optionally filters by schema name (e.g. 'public', 'analytics').
        """
        if not self.engine:
            raise ConnectionError("No active database connection.")

        with self.engine.connect() as conn:
            columns = self._fetch_columns(conn, schema_name)
            pks = self._fetch_primary_keys(conn, schema_name)
            fks = self._fetch_foreign_keys(conn, schema_name)

        return self._group_schema(columns, pks, fks)
    
    def get_schemas(self):
        """Return all schema names in the active database."""
        with self.engine.connect() as conn:
            result = conn.execute(
                text(
                    """
                SELECT schema_name
                FROM information_schema.schemata
                WHERE schema_name NOT LIKE 'pg_%'
                AND schema_name NOT IN ('information_schema')
                ORDER BY schema_name;
            """
                )
            )
            return [r[0] for r in result.fetchall()]
