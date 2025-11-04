from fastapi import APIRouter, HTTPException
from typing import Optional
from app.models.models_db_connector import PGDBConnector
from app.services.connections import (
    create_connection,
    get_connections,
    activate_connection,
    disconnect_connection,
)

router = APIRouter(prefix="/connections", tags=["Database Connections"])


@router.post("/save")
def save_connection(config: PGDBConnector, name: Optional[str] = None):
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
    return {"message": "Connection saved successfully.", "connection": result}


@router.get("/list")
def list_connections():
    connections = get_connections()
    if isinstance(connections, dict) and "error" in connections:
        raise HTTPException(status_code=500, detail=connections["error"])
    return {"total": len(connections), "connections": connections}


@router.post("/use/{connection_id}")
def use_connection(connection_id: int, password: str):
    """Activate and persist a connection by ID."""
    return activate_connection(connection_id, password)


@router.post("/disconnect")
def disconnect():
    """Close current connection."""
    return disconnect_connection()
