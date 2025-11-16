from app.services.schema_service import SchemaService
from app.services.database_service import db_session
from app.core.logger import create_logger


class ToolExecutor:

    def __init__(self):
        self.logger = create_logger()
        self.schema = None
        self.db = None

    def ensure_services(self):
        if self.schema is None:
            self.schema = SchemaService()
        if self.db is None:
            self.db = db_session
        if not self.db.is_connected():
            raise ValueError("No active database connection")

    def execute(self, name: str, args: dict):
        self.ensure_services()

        args = args or {}

        if "schema" in args and isinstance(args["schema"], str):
            args["schema"] = args["schema"].strip().lower()

        if "table" in args and isinstance(args["table"], str):
            args["table"] = args["table"].strip().lower()

        self.logger.info("Executing tool %s args=%s", name, args)

        dispatch = {
            "list_schemas": lambda: self.schema.get_schemas(),
            "list_tables": lambda: self.schema.get_table_names(args.get("schema")),
            "get_columns": lambda: self.schema.get_table_columns(
                args.get("table"), args.get("schema")
            ),
            "get_primary_keys": lambda: self.schema.get_primary_keys(
                args.get("schema"), args.get("table")
            ),
            "get_foreign_keys": lambda: self.schema.get_foreign_keys(
                args.get("schema"), args.get("table")
            ),
            "describe_table": lambda: self.schema.describe_table(
                args.get("schema"), args.get("table")
            ),
            "describe_schema": lambda: self.schema.get_schema_grouped(
                args.get("schema")
            ),
            "get_table_sample": lambda: self.db.execute(
                f"SELECT * FROM {args.get('schema')}.{args.get('table')} "
                f"LIMIT {int(args.get('limit', 5))}"
            ),
        }

        return dispatch.get(name, lambda: {"error": f"Unknown tool: {name}"})()
