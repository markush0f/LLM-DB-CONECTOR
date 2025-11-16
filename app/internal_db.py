import os
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DB_PATH = os.path.join(os.getcwd(), "app_data.db")

Base = declarative_base()
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

class Connection(Base):
    """Stores user-defined database connections."""
    __tablename__ = "connections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  
    host = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    user = Column(String, nullable=False)
    database = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "host": self.host,
            "port": self.port,
            "user": self.user,
            "database": self.database,
            "created_at": self.created_at.isoformat(),
        }

def init_internal_db():
    """Initialize SQLite database if not already created."""
    Base.metadata.create_all(bind=engine)
    print(f"Internal SQLite database ready at: {DB_PATH}")
