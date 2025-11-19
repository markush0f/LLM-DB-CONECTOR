from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError


from app.models.requests.models_db_connector import PGDBConnector
from app.models.schemas.connection_schema import Connection
from app.repository.connection_repository import ConnectionRepository
from app.services.database_service import db_session


# Repository instance
connection_repo = ConnectionRepository()


def create_connection(
    name: str, host: str, port: int, user: str, database: str, password: str
):
    """Create a new connection using the repository."""
    try:
        conn = Connection(
            name=name,
            host=host,
            port=port,
            user=user,
            database=database,
            password=password,
        )

        # CHANGE: Now using repository instead of direct SQLAlchemy session
        saved = connection_repo.create(conn)
        return saved.as_dict()

    except IntegrityError:
        return {"error": f"A connection named '{name}' already exists."}

    except Exception as e:
        return {"error": str(e)}


def get_connections():
    """Return all saved connections using the repository."""
    try:
        # CHANGE: repository read instead of session.query
        data = connection_repo.get_all()
        return [conn.as_dict() for conn in data]

    except Exception as e:
        return {"error": str(e)}


def activate_connection(connection_id: int, password: str):
    """Activate a connection using the repository."""
    # CHANGE: repository lookup
    conn = connection_repo.get_by_id(connection_id)

    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found.")

    config = PGDBConnector(
        host=conn.host,
        port=conn.port,
        user=conn.user,
        password=password,
        database=conn.database,
        name=conn.name,
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


def delete_connection_by_id(connection_id: int):
    """Delete a connection using the repository."""
    try:
        # CHANGE: repository delete instead of session.delete
        deleted = connection_repo.delete(connection_id)

        if not deleted:
            return {"error": "Connection not found."}

        return {"message": "Connection deleted successfully."}

    except Exception as e:
        return {"error": str(e)}
