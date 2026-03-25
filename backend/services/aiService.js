const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildTravelPrompt } = require("./promptBuilder");
const { calculateAllocation } = require("./budgetService");
const travelModes = require('../config/travelModes');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Main service to generate a structured AI itinerary.
 * Merges budget constraints with dynamic persona-based prompting.
 */
exports.getAIPlan = async (tripData) => {
    try {
        const { destination, days, budget, mode, interests, peopleCount } = tripData;
        const totalBudget = budget;
        const dailyBudget = Math.floor(budget / days);

        // Get optimized budget info
        const budgetInfo = calculateAllocation(totalBudget, days, mode);

        const prompt = `
            You are an expert travel planner. You MUST output ONLY valid JSON.
            
            Trip Details:
            - Destination: ${destination}
            - Duration: ${days} days
            - Total Budget: $${totalBudget}
            - Daily Budget: $${dailyBudget}
            - Mode: ${mode}
            - Group Size: ${peopleCount}
            - Interests: ${interests ? interests.join(', ') : 'General'}

            STRICT BUDGET CONSTRAINTS (Values in USD):
            - Travel Tier: ${budgetInfo.tier}
            - Max Nightly Hotel Cost: $${budgetInfo.breakdown.avgNightlyRate}
            - Max Daily Food Spend: $${budgetInfo.breakdown.dailyFood}
            - Max Daily Activity Spend: $${budgetInfo.breakdown.dailyActivities}

            CRITICAL RULES:
            1. No markdown, no conversational text.
            2. Every day MUST include Morning Activity, Lunch, Afternoon Activity, Dinner, and Evening Activity.
            3. Provide realistic "estimatedCost" for each item. 
            4. The total cost of activities for a single day MUST NOT exceed $${dailyBudget}.
            5. EVERY activity MUST be an actual, real-world, famous place strictly located WITHIN the destination city (${destination}). Do not provide generic names, use the actual specific name and include a precise "location".

            REQUIRED JSON FORMAT:
            {
              "overview": "A brief summary of the trip.",
              "dailyPlan": [
                {
                  "day": 1,
                  "title": "Arrival and Exploration",
                  "dailyBudgetAllocated": ${dailyBudget},
                  "activities": [
                    { "time": "10:00 AM", "name": "Visit [Specific Landmark]", "location": "Exact Address, ${destination}", "type": "activity", "estimatedCost": 25, "description": "Details..." },
                    { "time": "01:00 PM", "name": "Lunch at [Specific Restaurant]", "location": "Exact Address, ${destination}", "type": "lunch", "estimatedCost": 30, "description": "Details..." },
                    { "time": "07:00 PM", "name": "Dinner at [Specific Restaurant]", "location": "Exact Address, ${destination}", "type": "dinner", "estimatedCost": 45, "description": "Details..." }
                  ]
                }
              ]
            }
        `;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("--- 🤖 GEMINI RESPONSE RECEIVED ---");

        const parsedData = extractJSONObject(responseText);

        return {
            ...parsedData,
            budgetAllocation: budgetInfo,
            travelMode: mode
        };
    } catch (error) {
        console.error("AI GENERATION FAILED:", error.message);
        // Fallback to high-quality Mock data so the app remains usable
        return getMockData(tripData.destination, tripData.days, tripData.budget, tripData.mode);
    }
};

/**
 * Regenerates an existing itinerary based on user instructions.
 */
exports.regenerateAIPlan = async (existingTrip, userInstruction) => {
    const { destination, days, budget, itinerary, mode } = existingTrip;

    try {
        const prompt = `
            Current Itinerary for a ${days}-day ${mode || 'solo'} trip to ${destination} ($${budget}):
            ${JSON.stringify(itinerary, null, 2)}

            USER REQUEST: "${userInstruction}"
            
            STRICT RULES FOR REGENERATION:
            1. Maintain the destination, duration, and budget.
            2. NO REPETITION: Ensure that any newly added activities or places do not repeat existing ones.
            3. DIVERSITY: Use specific place names for all activities (Morning, Afternoon, Evening).
            4. Keep the response as valid JSON ONLY.
            5. Ensure the "dailyPlan" still contains EXACTLY ${days} days.
        `;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const parsedData = extractJSONObject(responseText);

        return {
            ...parsedData,
            budgetAllocation: existingTrip.itinerary?.budgetAllocation || null
        };

    } catch (error) {
        console.error("Gemini AI Regeneration Error:", error.message);
        throw error;
    }
};

/**
 * Helper: Safely extracts JSON from AI responses (even with markdown)
 */
function extractJSONObject(text) {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error("No JSON found");

        const cleanJson = text.substring(start, end + 1);
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("Failed to parse AI response into valid JSON.");
    }
}

/**
 * Fallback: Returns structured mock data if the API fails
 */
function getMockData(destination, days, budget, mode) {
    console.warn("⚠️ Switching to Mock Data due to Error/Quota.");

    const dailyBudget = Math.floor((budget || 1000) / (days || 3));
    const budgetInfo = calculateAllocation(budget || 1000, days || 3, mode);

    const mockActivities = [
        { time: "09:00 AM", name: "Famous Breakfast Spot", location: `City Center, ${destination}`, description: "Start your day with traditional local cuisine.", estimatedCost: 15 },
        { time: "11:30 AM", name: "City Museum", location: `Downtown, ${destination}`, description: "Explore the art and history of the region.", estimatedCost: 25 },
        { time: "02:00 PM", name: "Botanical Gardens", location: `Main Park, ${destination}`, description: "A relaxing stroll through the most famous park.", estimatedCost: 0 },
        { time: "07:00 PM", name: "Local Signature Dining", location: `Restaurant Row, ${destination}`, description: "A highly-rated restaurant with local specialties.", estimatedCost: 40 },
        { time: "09:30 PM", name: "City Viewpoint", location: `High Altitude Lounge, ${destination}`, description: "Catch the best views of the city at night.", estimatedCost: 0 }
    ];

    return {
        destination: destination || "Selected City",
        overview: "A sample itinerary (Generated as fallback due to API limits).",
        dailyPlan: Array.from({ length: days || 3 }, (_, i) => ({
            day: i + 1,
            title: `Day ${i + 1}: Exploring ${destination || 'the city'}`,
            dailyBudgetAllocated: dailyBudget,
            activities: mockActivities
        })),
        budgetAllocation: budgetInfo
    };
}