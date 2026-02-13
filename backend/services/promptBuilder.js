const buildTravelPrompt = (input) => {
    const { destination, days, budget, interests } = input;

    const interestText = Array.isArray(interests) && interests.length > 0
        ? interests.join(", ")
        : "general sightseeing";

    return `
    You are a travel assistant. Create a ${days}-day itinerary for a trip to ${destination} with a budget of ${budget}.
    The traveler is interested in: ${interestText}.

    IMPORTANT: Return the response ONLY as a valid JSON object. Do not include any markdown formatting, backticks, or extra text.
    
    The JSON structure must be exactly as follows:
    {
      "destination": "${destination}",
      "duration": "${days} days",
      "budget": "${budget}",
      "overview": "A brief summary of the trip.",
      "dailyPlan": [
        {
          "day": 1,
          "title": "Day theme or title",
          "activities": ["Activity 1", "Activity 2", "Activity 3"]
        }
        // ... repeat for each day
      ]
    }
    `;
};

module.exports = { buildTravelPrompt };
