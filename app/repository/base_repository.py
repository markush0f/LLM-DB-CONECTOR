from sqlmodel import select


class BaseRepository:
    """Generic repository for SQLModel tables."""

    model = None  # Must be set by subclasses

    def __init__(self, session_factory):
        # CHANGE: store session factory for the repository
        self.session_factory = session_factory

    def _session(self):
        return self.session_factory()

    def create(self, obj):
        with self._session() as session:
            session.add(obj)
            session.commit()
            session.refresh(obj)
            return obj

    def get_all(self):
        with self._session() as session:
            return session.exec(select(self.model)).all()

    def get_by_id(self, item_id: int):
        with self._session() as session:
            return session.exec(
                select(self.model).where(self.model.id == item_id)
            ).first()

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
