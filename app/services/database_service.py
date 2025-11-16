from sqlalchemy import create_engine, text
from app.models.models_db_connector import PGDBConnector

# CHANGE: imports for automatic schema-change invalidation
from app.core.metadata_cache_provider import metadata_cache
from app.services.sql_schema_change_monitor import SqlSchemaChangeMonitor


class DatabaseService:
    """
    Manages a single persistent database connection for the local environment.
    """

    def __init__(self):
        self.engine = None
        self.db_url = None

        self.schema_monitor = SqlSchemaChangeMonitor(metadata_cache)

    def connect(self, config: PGDBConnector) -> bool:
        self.db_url = f"postgresql://{config.user}:{config.password}@{config.host}:{config.port}/{config.database}"
        engine = create_engine(self.db_url)

        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            self.engine = engine
            return True
        except Exception:
            self.engine = None
            return False

    def execute(self, query: str):
        if not self.engine:
            raise ValueError("No active database connection. Call /connect_db first.")

        with self.engine.connect() as conn:
            result = conn.execute(text(query))

            # CHANGE: detect and process schema changes after SQL execution
            self.schema_monitor.handle_schema_change(query)

            try:
                rows = result.mappings().all()
                return [dict(row) for row in rows]
            except Exception:
                conn.commit()
                return {"message": "SQL executed successfully."}

    def disconnect(self) -> bool:
        if self.engine:
            self.engine.dispose()
            self.engine = None
            return True
        return False

    def is_connected(self) -> bool:
        return self.engine is not None


# GLOBAL SINGLETON
db_session = DatabaseService()
