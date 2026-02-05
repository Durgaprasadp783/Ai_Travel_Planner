def generate_plan(data):
    destination = data.get("destination", "Unknown")

    return {
        "destination": destination,
        "plan": f"AI generated travel plan for {destination}"
    }
