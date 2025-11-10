from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.schema_service import SchemaService

router = APIRouter(prefix="/db", tags=["Database Schema"])


@router.get("/schema")
def get_schema_grouped(
    schema: Optional[str] = Query(
        None,
        description="Schema name to filter (e.g. 'public')",
    )
):
    """
    Returns the database schema grouped by table,
    optionally filtered by schema name (e.g. ?schema=public).
    """
    service = SchemaService()
    schema_data = service.get_schema_grouped(schema)
    if not schema_data:
        return {"message": f"No tables found in schema '{schema or 'all'}'."}
    return schema_data


@router.get("/schemas")
def list_schemas():
    """Return all schema names in the database."""
    try:
        service = SchemaService()
        return service.get_schemas()
    except ConnectionError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/tables")
def list_tables(schema: str = "public"):
    """Return all table names from the given schema."""
    try:
        service = SchemaService()
        return service.get_table_names(schema)
    except ConnectionError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/columns")
def get_table_columns(
    table: str = Query(..., description="Table name to extract columns from"),
    schema: str = Query("public", description="Schema name (default: public)"),
):
    """
    Return all columns for a specific table, including data type,
    nullability, default value, and key relationships.
    """
    try:
        service = SchemaService()
        columns = service.get_table_columns(table_name=table, schema_name=schema)
        if not columns:
            raise HTTPException(
                status_code=404,
                detail=f"No columns found for table '{table}' in schema '{schema}'.",
            )
        return columns
    except ConnectionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error retrieving columns: {str(e)}"
        )
