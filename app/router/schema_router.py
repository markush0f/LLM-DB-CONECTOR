from fastapi import APIRouter, HTTPException
from app.services.schema_service import SchemaService

router = APIRouter(prefix="/db", tags=["Database Schema"])

@router.get("/schema")
def get_schema_grouped():
    """Return schema grouped by table."""
    try:
        service = SchemaService()
        return service.get_schema_grouped()
    except ConnectionError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/schemas")
def list_schemas():
    try:
        service = SchemaService()
        return service.get_schemas()
    except ConnectionError as e:
        raise HTTPException(status_code=400, detail=str(e))