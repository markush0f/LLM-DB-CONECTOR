from fastapi import APIRouter, HTTPException
from app.models.execute_sql_request import ExecuteRequest
from app.models.query_request import QueryRequest
from app.services.agent.sql_agent import SQLAssistantService
from app.services.database_service import DatabaseService

router = APIRouter(
    prefix="/llmsql",
    tags=["SQL Assistant"],
    responses={404: {"description": "Not found"}},
)

assistant = SQLAssistantService()
db_service = DatabaseService()


@router.post("/generate_sql")
async def generate_sql(req: QueryRequest):
    """
    Generates SQL using the intelligent multi-step agent.
    It will automatically inspect the DB using tools if needed.
    """
    user_input = req.user_input.strip()

    if not user_input:
        raise HTTPException(status_code=400, detail="Input is empty")

    try:
        agent_response = assistant.run(user_input)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

    if "error" in agent_response:
        raise HTTPException(status_code=400, detail=agent_response["error"])

    sql_code = agent_response.get("sql")
    explanation = agent_response.get("explanation")

    if not sql_code:
        raise HTTPException(status_code=400, detail="Agent did not produce SQL")

    return {
        "generated_sql": sql_code,
        "explanation": explanation,
        "preview": "Review this SQL before execution.",
    }


@router.post("/execute_sql")
def execute_sql(req: ExecuteRequest):
    """
    Executes the SQL safely through the internal database service.
    """
    sql = req.sql.strip()

    if not sql:
        raise HTTPException(status_code=400, detail="SQL is empty")

    try:
        result = db_service.execute(sql)
        return {"executed_sql": sql, "result": result}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
def get_sql_history():
    return "..."
