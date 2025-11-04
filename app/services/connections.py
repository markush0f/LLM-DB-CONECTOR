from app.internal_db import SessionLocal, Connection
from app.models.models_db_connector import PGDBConnector
from app.services.db_session import db_session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException


def create_connection(name: str, host: str, port: int, user: str, database: str):
    """Save a new DB connection configuration."""
    session = SessionLocal()
    try:
        conn = Connection(
            name=name,
            host=host,
            port=port,
            user=user,
            database=database,
        )
        session.add(conn)
        session.commit()
        session.refresh(conn)
        return conn.as_dict()
    except IntegrityError:
        session.rollback()
        return {"error": f"A connection named '{name}' already exists."}
    except Exception as e:
        session.rollback()
        return {"error": str(e)}
    finally:
        session.close()


def get_connections():
    """Return all saved connections."""
    session = SessionLocal()
    try:
        data = session.query(Connection).all()
        return [conn.as_dict() for conn in data]
    except Exception as e:
        return {"error": str(e)}
    finally:
        session.close()


def activate_connection(connection_id: int, password: str):
    """Activate and persist a database connection by ID."""
    session = SessionLocal()
    conn = session.query(Connection).filter(Connection.id == connection_id).first()
    session.close()

    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found.")

    config = PGDBConnector(
        host=conn.host,
        port=conn.port,
        user=conn.user,
        password=password,
        database=conn.database,
    )

    success = db_session.connect(config)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to connect to database.")

    return {"message": f"Connected successfully to '{conn.name}'"}


def disconnect_connection():
    """Disconnect the active session."""
    if db_session.disconnect():
        return {"message": "Disconnected successfully."}
    raise HTTPException(status_code=400, detail="No active connection to close.")
