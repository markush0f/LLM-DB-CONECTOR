from app.services.schema_service import SchemaService
from app.services.database_service import db_session
from app.core.logger import create_logger
from app.core.metadata_cache_provider import metadata_cache


class ToolExecutor:
    def __init__(self):
        self.logger = create_logger()
        self.schema = SchemaService()
        self.db = db_session

    def ensure_services(self):
        if self.schema is None:
            self.schema = SchemaService()

        if self.db is None:
            self.db = db_session

        if not self.db.is_connected():
            raise ValueError("No active database connection")

    def execute(self, name: str, args: dict):
        args = args or {}

        if "schema" in args and isinstance(args["schema"], str):
            args["schema"] = args["schema"].strip().lower()

        if "table" in args and isinstance(args["table"], str):
            args["table"] = args["table"].strip().lower()

        # Cache-aware describe_table
        if name == "describe_table":
            return self._cached_describe_table(args)

        dispatch = {
            "list_schemas": lambda: self.schema.get_schemas(),
            "list_tables": lambda: self.schema.get_table_names(args.get("schema")),
            "get_columns": lambda: self.schema.get_columns(
                args.get("schema"),
                args.get("table"),
            ),
        }

        if name not in dispatch:
            raise ValueError(f"Unknown tool: {name}")

        return dispatch[name]()

    # Uses cache to avoid schema queries
    def _cached_describe_table(self, args: dict):
        schema = args.get("schema")
        table = args.get("table")

        cached = metadata_cache.get_table(schema, table)
        if cached:
            self.logger.info("Using cached metadata for %s.%s", schema, table)
            return cached

        columns = self.schema.get_columns(schema, table)
        pks = self.schema.get_primary_keys(schema, table)
        fks = self.schema.get_foreign_keys(schema, table)

        metadata = {
            "columns": columns,
            "primary_keys": pks,
            "foreign_keys": fks,
        }

        metadata_cache.store_table(schema, table, metadata)

        return metadata
