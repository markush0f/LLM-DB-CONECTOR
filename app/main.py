from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core.logger_middleware import RequestLoggingMiddleware
from app.core.middleware_body_logger import BodyLoggingMiddleware
from app.internal_db import init_internal_db
from app.services.database_service import DatabaseService
from app.router.connections_router import router as connections_router
from app.router.llm_sql_router import router as llm_sql_router
from app.router.schema_router import router as schema_router
from app.router.cache_router import router as cache_router
from app.router.model_router import router as model_router
from app.router.message_router import router as message_router
from fastapi.middleware.cors import CORSMiddleware

init_internal_db()

app = FastAPI(title="LLM-DB CONNECTOR API", version="1.0.0")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4321",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def list_routes():
    routes_info = []
    for route in app.router.routes:
        routes_info.append({"path": route.path})

    return {"available_endpoints": routes_info}


app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(BodyLoggingMiddleware)

db_service = DatabaseService()
app.include_router(connections_router)
app.include_router(llm_sql_router)
app.include_router(schema_router)
app.include_router(cache_router)
app.include_router(model_router)
app.include_router(message_router)

app.mount(
    "/admin",
    StaticFiles(
        directory="/home/markus/Desktop/llm-db-conector/static/admin/dist", html=True
    ),
    name="admin",
)
