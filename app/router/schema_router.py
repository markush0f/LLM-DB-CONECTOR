from fastapi import APIRouter, HTTPException
from app.services.schema_service import SchemaService

router = APIRouter(prefix="/db", tags=["Database Schema"])

@router.get("/schema")
def get_schema():
    """Get schema from currently active database connection."""
    try:
        service = SchemaService()
        return service.get_schema()
    except ConnectionError as e:
        raise HTTPException(status_code=400, detail=str(e))
