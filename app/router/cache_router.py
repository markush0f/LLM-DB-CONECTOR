import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse

from app.core.metadata_cache_provider import metadata_cache
from app.models.requests.metadata_cache_invalid_request import MetadataCacheInvalidateRequest

router = APIRouter(prefix="/cache", tags=["cache"])


@router.post("/metadata/invalidate")
def invalidate_metadata_cache(payload: MetadataCacheInvalidateRequest):
    schema = payload.schema_name.lower().strip() if payload.schema_name else None
    table = payload.table_name.lower().strip() if payload.table_name else None

    if schema and table:
        metadata_cache.invalidate_table(schema, table)
        return {"status": "ok", "message": f"Invalidated cache for {schema}.{table}"}

    if schema and not table:
        metadata_cache.invalidate_schema(schema)
        return {"status": "ok", "message": f"Invalidated cache for schema {schema}"}

    if not schema and not table:
        metadata_cache.invalidate_all()
        return {"status": "ok", "message": "Invalidated entire metadata cache"}

    raise HTTPException(status_code=400, detail="Invalid cache invalidation request")


@router.get("/metadata/status")
def get_metadata_cache_status():
    return metadata_cache.get_status()
