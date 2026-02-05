from fastapi import FastAPI
from app.routes.planner import router

app = FastAPI()

app.include_router(router)

@app.get("/")
def home():
    return {"status": "AI Service Running"}
