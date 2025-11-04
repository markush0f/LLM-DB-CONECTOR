from fastapi import APIRouter, HTTPException
from app.models.models_db_connector import PGDBConnector
from typing import Optional

from app.services.connections import create_connection, get_connections

router = APIRouter(
    prefix="/connections",
    tags=["Database Connections"],
    responses={404: {"description": "Not found"}},
)


@router.post("/save")
def save_connection(config: PGDBConnector, name: Optional[str] = None):
    """
    Save a new database connection into the internal SQLite storage.
    If no name is provided, one is generated automatically.
    """
    connection_name = name or f"{config.database}@{config.host}"
    result = create_connection(
        name=connection_name,
        host=config.host,
        port=config.port,
        user=config.user,
        database=config.database,
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "message": "Connection saved successfully.",
        "connection": result,
    }


@router.get("/list")
def list_connections():
    """
    Retrieve all saved database connections from the internal SQLite DB.
    """
    connections = get_connections()
    if isinstance(connections, dict) and "error" in connections:
        raise HTTPException(status_code=500, detail=connections["error"])

    return {
        "total": len(connections),
        "connections": connections,
    }
