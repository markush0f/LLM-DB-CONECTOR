from sqlmodel import select
from app.internal_db import get_local_session
from app.models.schemas.active_model_schema import ActiveModel


class ActiveModelRepository:
    def __init__(self):
        self.session_factory = get_local_session

    def get_active(self) -> ActiveModel | None:
        with self.session_factory() as session:
            return session.exec(select(ActiveModel)).first()

    def set_active(self, model_id: int):
        with self.session_factory() as session:
            existing = session.exec(select(ActiveModel)).first()
            if existing:
                session.delete(existing)
                session.commit()

            new = ActiveModel(model_id=model_id)
            session.add(new)
            session.commit()
            session.refresh(new)
            return new
