from sqlmodel import select

from app.internal_db import get_local_session
from app.models.schemas.connection_schema import Connection
from app.repository.base_repository import BaseRepository


class ConnectionRepository(BaseRepository):
    model = Connection

    def __init__(self):
        super().__init__(session_factory=get_local_session)

    # Specific query included for search by name
    def get_by_name(self, name: str):
        with self._session() as session:
            return session.exec(
                select(Connection).where(Connection.name == name)
            ).first()
