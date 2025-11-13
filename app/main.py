from fastapi import FastAPI
from app.core.logger_middleware import RequestLoggingMiddleware
from app.core.middleware_body_logger import BodyLoggingMiddleware
from app.internal_db import init_internal_db
from app.services.internal_database_service import DatabaseService
from app.router.connections_router import router as connections_router
from app.router.llm_sql_router import router as llm_sql_router
from app.router.schema_router import router as schema_router
from fastapi.middleware.cors import CORSMiddleware


init_internal_db()

app = FastAPI(title="LLM-DB CONNECTOR API", version="1.0.0")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    RequestLoggingMiddleware,
    BodyLoggingMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
db_service = DatabaseService()
app.include_router(connections_router)
app.include_router(llm_sql_router)
app.include_router(schema_router)
