const buildTravelPrompt = (input) => {
  const { origin, destination, days, budget, interests, peopleCount, smartPrompt } = input;

  const interestText = Array.isArray(interests) && interests.length > 0
    ? interests.join(", ")
    : "general sightseeing";

  const groupText = peopleCount ? `for a group of ${peopleCount} member(s)` : "";

  const userInstructionBlock = smartPrompt
    ? `\nSPECIAL USER INSTRUCTIONS (CRITICAL PRIORITY):\n"${smartPrompt}"\nMake absolutely sure to adapt the itinerary and activities to fit these instructions.\n`
    : "";

  return `
    You are a professional world-class travel planner.
    
    Create a highly detailed, non-repetitive travel itinerary ${groupText} for EXACTLY ${days} full days, starting from ${origin} to ${destination}.
    
    CRITICAL INSTRUCTION: The user's specific interests are: ${interestText}. 
    You MUST prioritize activities, restaurants, and sights that align with these interests.

    Trip Details:
    - Destination: ${destination}
    - Duration: ${days} Days
    - Budget: ${budget} USD
    - Group Size: ${peopleCount || 1}
    - Start Point: ${origin || 'City Center'}
    - Traveler Interests: ${interestText}
    ${userInstructionBlock}

    STRICT PLANNIG RULES:
    0. LOCATION BOUNDARY: CRITICAL: Every single place, restaurant, and activity you suggest MUST be physically located within the boundary of the exact destination city requested. Do NOT suggest places in neighboring cities, states, or countries. Double-check the coordinates/location of each suggestion to ensure it belongs to the destination city.
    0.1 CRITICAL GEOGRAPHY RULE: You must provide accurate, real-world latitude and longitude coordinates for EVERY place, hotel, and activity. Every single coordinate pair MUST physically fall within the exact geographic boundaries of the destination city. DO NOT invent random coordinates. If you do not know the exact coordinates of a specific restaurant or museum, you MUST use the destination city's central coordinates and add a tiny microscopic offset (e.g., +/- 0.005) so the pins cluster correctly in the destination city on the map.
    1. START LOCATION: Day 1 MUST begin near the specified start point (${origin || 'City Center'}).
    2. GENERATE EXACTLY ${days} DAYS: Your response MUST include a unique "days" array entry for every single day from Day 1 to Day ${days}.
    3. VARIETY & UNIQUE CONTENT: Each day must feature DIFFERENT attractions and specific place names.
    4. NO REPETITION: Absolutely NO attractions, restaurants, or specific activities should appear more than once in the entire itinerary.
    5. STRUCTURE: Each day must include at least 3 distinct activities:
       - Morning activity (a specific, named place or attraction)
       - Afternoon activity (a specific, named place or attraction)
       - Evening activity (a specific experience or dining location)
    6. LOGICAL FLOW: Group activities that are geographically close together within the same day.
    7. BUDGET COMPLIANCE: Ensure suggested activities and dining options fit within the total budget of ${budget} USD for ${days} days.

    IMPORTANT: Return the response ONLY as a valid JSON object. Do not include any markdown formatting, backticks, or extra text.
    
    The JSON structure must be exactly as follows:
    {
      "destination": "${destination}",
      "duration": "${days} days",
      "budget": "${budget}",
      "overview": "A brief but professional summary of the trip highlighting the unique variety of your plan.",
      "days": [
        {
          "day": 1,
          "title": "Unique Theme for Day 1",
          "places": [
            {
              "name": "Named Morning Attraction",
              "time": "10:00 AM",
              "location": "Named Morning Attraction, City"
            },
            {
              "name": "Named Afternoon Attraction",
              "time": "2:00 PM",
              "location": "Named Afternoon Attraction, City"
            },
            {
              "name": "Named Evening Attraction",
              "time": "7:00 PM",
              "location": "Named Evening Attraction, City"
            }
          ]
        },
        // ... include unique entries for Day 2 through Day ${days}
        {
          "day": ${days},
          "title": "Unique Theme for Final Day",
          "places": [
            {
              "name": "Final Morning Attraction",
              "time": "09:00 AM",
              "location": "Final Morning Attraction, City"
            },
            {
               "name": "Final Afternoon Attraction",
               "time": "1:00 PM",
               "location": "Final Afternoon Attraction, City"
            },
            {
               "name": "Final Evening Attraction",
               "time": "6:00 PM",
               "location": "Final Evening Attraction, City"
            }
          ]
        }
      ]
    }
    `;
};

module.exports = { buildTravelPrompt };
