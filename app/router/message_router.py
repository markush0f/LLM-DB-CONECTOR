from fastapi import APIRouter, HTTPException, Query
from app.services.message_service import MessageService

router = APIRouter(
    prefix="/messages",
    tags=["Messages of assistant and user"],
    responses={404: {"description": "Not found"}},
)

message_service = MessageService()


@router.get("/user")
def get_messages_of_user(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    return message_service.get_user_messages(page=page, limit=limit)


@router.get("/assistant")
def get_messages_of_assistant(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    return message_service.get_assistant_messages(page=page, limit=limit)


@router.get("/stats")
def get_stats():
    stats = message_service.get_stats()

    return {
        # "total_conversations": stats.total_conversations,
        "total_messages": stats["total_messages"],
        "models_used": stats["models_used"],
    }


@router.delete("/{role}/{message_id}")
def delete_message(role: str, message_id: int):
    return message_service.delete_message(message_id, role)
