from fastapi import APIRouter, HTTPException

from app.core.metadata_cache_provider import metadata_cache
from app.models.metadata_cache_invalid_request import MetadataCacheInvalidateRequest

router = APIRouter(prefix="/cache", tags=["cache"])


@router.post("/metadata/invalidate")
def invalidate_metadata_cache(payload: MetadataCacheInvalidateRequest):
    schema = payload.schema.lower().strip() if payload.schema else None
    table = payload.table.lower().strip() if payload.table else None

    if schema and table:
        metadata_cache.invalidate_table(schema, table)
        return {"status": "ok", "message": f"Invalidated cache for {schema}.{table}"}

    if schema and not table:
        metadata_cache.invalidate_schema(schema)
        return {"status": "ok", "message": f"Invalidated cache for schema {schema}"}

    # CHANGE: invalidate all
    if not schema and not table:
        metadata_cache.invalidate_all()
        return {"status": "ok", "message": "Invalidated entire metadata cache"}

    raise HTTPException(status_code=400, detail="Invalid cache invalidation request")
