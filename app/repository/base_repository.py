from sqlmodel import select
from app.internal_db import SessionLocal


def get_local_session():
    return SessionLocal()


class BaseRepository:
    """Generic repository with common CRUD operations.
    Other repositories should inherit from this class.
    """

    model = None  # Subclasses must set this

    def __init__(self):
        self.session_factory = get_local_session

    def _session(self):
        return self.session_factory()

    # Create
    def create(self, obj):
        with self._session() as session:
            session.add(obj)
            session.commit()
            session.refresh(obj)
            return obj

    # Get all
    def get_all(self):
        with self._session() as session:
            return session.exec(select(self.model)).all()

    # Get by ID
    def get_by_id(self, item_id: int):
        with self._session() as session:
            return session.exec(
                select(self.model).where(self.model.id == item_id)
            ).first()

    # Delete
    def delete(self, item_id: int):
        with self._session() as session:
            obj = session.exec(
                select(self.model).where(self.model.id == item_id)
            ).first()

            if not obj:
                return False

            session.delete(obj)
            session.commit()
            return True

    # Update (simple version)
    def update(self, item_id: int, **fields):
        with self._session() as session:
            obj = session.exec(
                select(self.model).where(self.model.id == item_id)
            ).first()

            if not obj:
                return None

            for key, value in fields.items():
                setattr(obj, key, value)

            session.commit()
            session.refresh(obj)
            return obj
