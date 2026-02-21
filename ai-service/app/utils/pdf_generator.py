from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4

def generate_itinerary_pdf(itinerary_data, filename="itinerary.pdf"):
    try:
        doc = SimpleDocTemplate(filename, pagesize=A4)
        elements = []

        styles = getSampleStyleSheet()
        title_style = styles["Heading1"]
        normal_style = styles["Normal"]

        # Title
        elements.append(Paragraph("AI Travel Planner Itinerary", title_style))
        elements.append(Spacer(1, 0.5 * inch))

        # Destination
        elements.append(Paragraph(f"Destination: {itinerary_data.get('destination', 'Unknown')}", normal_style))
        elements.append(Spacer(1, 0.3 * inch))

        # Daily Plan
        if "dailyPlan" in itinerary_data:
            for day in itinerary_data["dailyPlan"]:
                day_title = day.get('title', 'Day')
                day_num = day.get('day', '?')
                
                heading_text = f"Day {day_num}: {day_title}"
                elements.append(Paragraph(heading_text, styles["Heading2"]))
                elements.append(Spacer(1, 0.2 * inch))
                
                # Check if 'activities' exists (from aiService.js mock data) or 'description'
                if 'activities' in day:
                    for activity in day['activities']:
                        elements.append(Paragraph(f"- {activity}", normal_style))
                        elements.append(Spacer(1, 0.1 * inch))
                elif 'description' in day:
                    elements.append(Paragraph(day['description'], normal_style))
                
                elements.append(Spacer(1, 0.5 * inch))

        doc.build(elements)
        return filename
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise e
