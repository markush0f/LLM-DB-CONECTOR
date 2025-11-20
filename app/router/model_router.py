from fastapi import APIRouter
from app.models.requests.create_model_request import CreateModelRequest
from app.services.model_service import ModelService
from app.services.active_model_service import ActiveModelService
from fastapi import HTTPException
from app.models.requests.model_settings_request import UpdateModelSettingsRequest

router = APIRouter(
    prefix="/model",
    tags=["Model settings"],
    responses={404: {"description": "Not found"}},
)

model_service = ModelService()
active_model_service = ActiveModelService()


@router.post("/")
async def add_model(req: CreateModelRequest):
    model = model_service.create_model(
        model_name=req.model_name,
        system_prompt=req.system_prompt,
        context=req.context,
        temperature=req.temperature,
        top_p=req.top_p,
        seed=req.seed,
    )
    return model


@router.get("/list")
async def list_models():
    models = model_service.get_all_models()
    return models


@router.get("/active")
def get_active_settings():
    active_model = active_model_service.get_active_model()
    if not active_model:
        raise HTTPException(status_code=404, detail="No model settings found.")
    return active_model


@router.put("/update")
def update_settings(payload: UpdateModelSettingsRequest):
    updates = {k: v for k, v in payload.dict().items() if v is not None}

    if not updates:
        raise HTTPException(status_code=400, detail="No update fields provided.")

    updated = model_service.update_settings(**updates)

    model_service.load_model_from_settings()

    return {
        "message": "Settings updated and model reloaded.",
        "settings": updated,
    }


@router.post("/set/{model_id}")
def set_active_model(model_id: int):
    model = model_service.get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found.")

    active_model_service.set_active_model(model_id)
    active_model = active_model_service.get_active_model()

    return {"message": "Active model updated", "active_model": active_model}
