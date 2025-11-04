from sqlalchemy import create_engine, text
from app.models.models_db_connector import PGDBConnector

class DBSessionManager:
    """
    Manages a single persistent connection to the user-selected database.
    Once connected, the engine stays active until manually disconnected.
    """

    def __init__(self):
        self.engine = None
        self.db_url = None

    def connect(self, config: PGDBConnector) -> bool:
        """Creates a single engine and verifies the connection."""
        self.db_url = (
            f"postgresql://{config.user}:{config.password}@{config.host}:{config.port}/{config.database}"
        )
        engine = create_engine(self.db_url)

        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            self.engine = engine
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            self.engine = None
            return False

    def is_connected(self) -> bool:
        """Check if there’s an active connection."""
        return self.engine is not None

    def execute(self, query: str):
        """Run SQL using the active connection."""
        if not self.engine:
            raise ValueError("No active connection. Call /connections/use/{id} first.")

        with self.engine.connect() as conn:
            result = conn.execute(text(query))
            try:
                rows = result.mappings().all()
                return [dict(row) for row in rows]
            except Exception:
                conn.commit()
                return {"message": "SQL executed successfully."}

    def disconnect(self):
        """Close the current active connection."""
        if self.engine:
            self.engine.dispose()
            self.engine = None
            return True
        return False


# Global singleton instance
db_session = DBSessionManager()
