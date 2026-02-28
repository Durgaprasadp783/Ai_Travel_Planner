const buildTravelPrompt = (input) => {
  const { origin, destination, days, budget, interests, smartPrompt } = input;

  const interestText = Array.isArray(interests) && interests.length > 0
    ? interests.join(", ")
    : "general sightseeing";

  const userInstructionBlock = smartPrompt
    ? `\nSPECIAL USER INSTRUCTIONS (CRITICAL PRIORITY):\n"${smartPrompt}"\nMake absolutely sure to adapt the itinerary and activities to fit these instructions.\n`
    : "";

  return `
    You are a professional world-class travel planner.
    
    Create a highly detailed, non-repetitive travel itinerary for EXACTLY ${days} full days, starting from ${origin} to ${destination}.
    
    Trip Details:
    - Destination: ${destination}
    - Duration: ${days} Days
    - Budget: ${budget} USD
    - Traveler Interests: ${interestText}
    ${userInstructionBlock}

    STRICT PLANNIG RULES:
    1. GENERATE EXACTLY ${days} DAYS: Your response MUST include a unique "dailyPlan" entry for every single day from Day 1 to Day ${days}.
    2. VARIETY & UNIQUE CONTENT: Each day must feature DIFFERENT attractions and specific place names.
    3. NO REPETITION: Absolutely NO attractions, restaurants, or specific activities should appear more than once in the entire itinerary.
    4. STRUCTURE: Each day must include at least 3 distinct activities:
       - Morning activity (a specific, named place or attraction)
       - Afternoon activity (a specific, named place or attraction)
       - Evening activity (a specific experience or dining location)
    5. LOGICAL FLOW: Group activities that are geographically close together within the same day.
    6. BUDGET COMPLIANCE: Ensure suggested activities and dining options fit within the total budget of ${budget} USD for ${days} days.

    IMPORTANT: Return the response ONLY as a valid JSON object. Do not include any markdown formatting, backticks, or extra text.
    
    The JSON structure must be exactly as follows:
    {
      "destination": "${destination}",
      "duration": "${days} days",
      "budget": "${budget}",
      "overview": "A brief but professional summary of the trip highlighting the unique variety of your plan.",
      "dailyPlan": [
        {
          "day": 1,
          "title": "Unique Theme for Day 1",
          "activities": ["Named Morning Attraction", "Named Afternoon Attraction", "Named Evening Attraction"]
        },
        // ... include unique entries for Day 2 through Day ${days}
        {
          "day": ${days},
          "title": "Unique Theme for Final Day",
          "activities": ["Final Morning Attraction", "Final Afternoon Attraction", "Final Evening Attraction"]
        }
      ]
    }
    `;
};

module.exports = { buildTravelPrompt };
