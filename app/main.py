from fastapi import FastAPI

from app.models.models_db_connector import PGDBConnector


app = FastAPI(title="LLM-DB CONNECTOR API", version="1.0.0")

@app.post("/test_connection_db/")
def test_connection_db( config: PGDBConnector):
    from app.db_connector import DBConnector
    db_connector = DBConnector(config)
    is_connected = db_connector.test_connection()
    return {"is_connected": is_connected}