from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.utils.pdf_generator import generate_itinerary_pdf

router = APIRouter()

@router.post("/generate-pdf")
def create_pdf(itinerary: dict):
    file_path = generate_itinerary_pdf(itinerary)
    return FileResponse(file_path, media_type="application/pdf", filename="itinerary.pdf")
