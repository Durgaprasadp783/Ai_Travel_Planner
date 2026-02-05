from fastapi import APIRouter
from app.services.ai_engine import generate_plan

router = APIRouter(prefix="/ai")

@router.post("/plan")
def create_plan(data: dict):
    return generate_plan(data)
