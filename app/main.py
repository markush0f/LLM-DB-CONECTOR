from fastapi import FastAPI
from app.internal_db import init_internal_db
from app.services.internal_database_service import DatabaseService
from app.router.connections_router import router as connections_router
from app.router.llm_sql_router import router as llm_sql_router
from app.router.schema_router import router as schema_router

init_internal_db()

app = FastAPI(title="LLM-DB CONNECTOR API", version="1.0.0")
db_service = DatabaseService()
app.include_router(connections_router)
app.include_router(llm_sql_router)
app.include_router(schema_router)
