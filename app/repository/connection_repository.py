from app.models.schemas.connection_schema import Connection
from app.repositories.base_repository import BaseRepository


class ConnectionRepository(BaseRepository):
    model = Connection
