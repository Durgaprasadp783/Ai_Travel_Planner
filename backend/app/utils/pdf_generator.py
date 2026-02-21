from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics


def generate_itinerary_pdf(itinerary_data, filename="itinerary.pdf"):
    doc = SimpleDocTemplate(filename, pagesize=A4)
    elements = []

    styles = getSampleStyleSheet()
    title_style = styles["Heading1"]
    normal_style = styles["Normal"]

    # Title
    elements.append(Paragraph("AI Travel Planner Itinerary", title_style))
    elements.append(Spacer(1, 0.5 * inch))

    # Destination
    elements.append(Paragraph(f"Destination: {itinerary_data['destination']}", normal_style))
    elements.append(Spacer(1, 0.3 * inch))

    # Daily Plan
    for day in itinerary_data["dailyPlan"]:
        elements.append(Paragraph(f"Day {day['day']}: {day['title']}", styles["Heading2"]))
        elements.append(Spacer(1, 0.2 * inch))
        elements.append(Paragraph(day["description"], normal_style))
        elements.append(Spacer(1, 0.5 * inch))

    doc.build(elements)

    return filename
