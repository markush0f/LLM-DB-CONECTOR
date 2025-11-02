from sqlalchemy import create_engine, text
from app.models.models_db_connector import PGDBConnector


class DatabaseService:
    """
    Manages a single persistent database connection for the local environment.
    The connection is established once by the user through /connect_db,
    and reused by all subsequent queries.
    """

    def __init__(self):
        self.engine = None
        self.db_url = None

    def connect(self, config: PGDBConnector) -> bool:
        """Create and test a single persistent connection."""
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
        """Execute SQL using the active engine."""
        if not self.engine:
            raise ValueError("No active database connection. Call /connect_db first.")

        with self.engine.connect() as conn:
            result = conn.execute(text(query))
            try:
                rows = result.mappings().all()
                return [dict(row) for row in rows]
            except Exception:
                conn.commit()
                return {"message": "SQL executed successfully."}

    def disconnect(self) -> bool:
        """Close current connection."""
        if self.engine:
            self.engine.dispose()
            self.engine = None
            return True
        return False
