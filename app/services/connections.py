from app.internal_db import SessionLocal, Connection
from sqlalchemy.exc import IntegrityError

def create_connection(name: str, host: str, port: int, user: str, database: str):
    """Create and save a new connection record in the local SQLite DB."""
    session = SessionLocal()
    try:
        connection = Connection(
            name=name,
            host=host,
            port=port,
            user=user,
            database=database,
        )
        session.add(connection)
        session.commit()
        session.refresh(connection)
        return connection.as_dict()
    except IntegrityError:
        session.rollback()
        return {"error": f"A connection with the name '{name}' already exists."}
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
