from sqlalchemy import create_engine, text
from app.models.models_db_connector import PGDBConnector


class DBConnector:
    def __init__(self, config: PGDBConnector, db_connection: str = ""):
        self.config = config
        self.db_connection = db_connection
        self._create_connection()

    def _create_connection(self) -> str:
        if isinstance(self.config, PGDBConnector):
            self.db_connection = f"postgresql://{self.config.user}:{self.config.password}@{self.config.host}:{self.config.port}/{self.config.database}"
            self.engine = create_engine(self.db_connection)
            return self.db_connection
        raise ValueError("Invalid config type")

    def test_connection(self) -> bool:
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                return result.scalar() == 1
        except Exception:
            return False

    def execute_sql(self, query: str):
        with self.engine.connect() as connection:
            result = connection.execute(text(query))
            return result.fetchall()
