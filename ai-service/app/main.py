from fastapi import FastAPI
from app.routes.planner import router

from app.routes import pdf

app = FastAPI()

app.include_router(router)
app.include_router(pdf.router, prefix="/api/pdf")

@app.get("/")
def home():
    return {"status": "AI Service Running"}
