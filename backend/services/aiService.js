const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildTravelPrompt } = require("./promptBuilder");
const { calculateAllocation } = require("./budgetService");
const travelModes = require('../config/travelModes');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Main service to generate a structured AI itinerary.
 * Injects Persona-based instructions and Budget-specific constraints.
 */
exports.getAIPlan = async (tripData) => {
    const { totalBudget, days, destination, mode = 'solo', interests } = tripData;

    try {
        // 1. Get optimized budget & mode configuration
        const budgetInfo = calculateAllocation(totalBudget, days, mode);
        const modeConfig = travelModes[mode] || travelModes['solo'];

        // 2. Build the Persona & Budget-aware Prompt
        const basePrompt = buildTravelPrompt(tripData);

        const systemInstruction = `You are a world-class travel expert specializing in ${mode} travel. 
        Persona Context: ${modeConfig.prompt}`;

        const prompt = `
            ${systemInstruction}
            
            ${basePrompt}

            STRICT BUDGET CONSTRAINTS (Values in USD):
            - Travel Tier: ${budgetInfo.tier}
            - Max Nightly Hotel Cost: $${budgetInfo.breakdown.avgNightlyRate}
            - Max Daily Food Spend: $${budgetInfo.breakdown.dailyFood}
            - Max Daily Activity Spend: $${budgetInfo.breakdown.dailyActivities}
            
            IMPORTANT: Ensure all suggested locations and restaurants strictly align with the "${mode}" persona and fit within these price caps.
            Return the response in valid JSON format only.
        `;

        // 3. Generate Content from Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("--- 🤖 RAW GEMINI RESPONSE START ---");
        console.log(responseText);
        console.log("--- 🤖 RAW GEMINI RESPONSE END ---");

        // 4. Parse JSON Response
        const parsedData = extractJSONObject(responseText);

        return {
            ...parsedData,
            budgetAllocation: budgetInfo,
            travelMode: mode
        };

    } catch (error) {
        console.error("Gemini AI Service Error:", error.message);
        // Fallback to High-Quality Mock Data if API is rate limited or unavailable
        return getMockData(destination, days, totalBudget, mode);
    }
};

/**
 * Regenerates an existing itinerary based on user instructions.
 */
exports.regenerateAIPlan = async (existingTrip, userInstruction) => {
    const { destination, days, budget, itinerary, travelMode } = existingTrip;

    try {
        const prompt = `
            Current Itinerary for a ${days}-day ${travelMode || 'solo'} trip to ${destination} ($${budget}):
            ${JSON.stringify(itinerary, null, 2)}

            USER REQUEST: "${userInstruction}"
            
            STRICT RULES FOR REGENERATION:
            1. Maintain the destination, duration, and budget.
            2. NO REPETITION: Ensure that any newly added activities or places do not repeat existing ones unless specifically requested.
            3. DIVERSITY: Use specific place names for all activities (Morning, Afternoon, Evening).
            4. Keep the response as valid JSON ONLY.
            5. Ensure the "dailyPlan" still contains EXACTLY ${days} days.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const parsedData = extractJSONObject(responseText);

        return {
            ...parsedData,
            budgetAllocation: existingTrip.itinerary.budgetAllocation
        };

    } catch (error) {
        console.error("Gemini AI Regeneration Error:", error.message);
        throw error;
    }
};

/**
 * Helper: Safely extracts JSON from Markdown-wrapped AI responses
 */
function extractJSONObject(text) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end === -1 || start >= end) {
        throw new Error("No valid JSON found in AI response");
    }

    const cleanJson = text.substring(start, end + 1);
    return JSON.parse(cleanJson);
}

/**
 * Fallback: Returns structured mock data if the API fails
 */
function getMockData(destination, days, budget, mode) {
    console.warn("⚠️ Switching to Mock Data for demonstration.");
    const fallbackBudget = calculateAllocation(budget || 1000, days || 3, mode);

    // Add some variation to the titles/activities if they are repeating
    const activities = [
        ["Explore Downtown", "Visit Central Park", "Skyline Dinner"],
        ["Historic District Walk", "Local Market Tour", "Live Music Session"],
        ["Nature Park Visit", "Riverside Lunch", "Sunset Promenade"],
        ["Art Gallery Tour", "Botanical Garden", "Harbor Cruise"],
        ["Boutique Shopping", "Museum of Modern Art", "Theater Night"]
    ];

    return {
        destination: destination || "Explore City",
        duration: `${days || 3} days`,
        budgetTier: fallbackBudget.tier,
        overview: "This is a fallback itinerary generated because the AI service is currently unavailable.",
        dailyPlan: Array.from({ length: days || 3 }, (_, i) => ({
            day: i + 1,
            title: `Discover ${destination || 'the area'} - Part ${i + 1}`,
            activities: activities[i % activities.length] || [
                `Visit local spots suited for ${mode} travelers`,
                `Enjoy lunch within $${fallbackBudget.breakdown.dailyFood / 2} limit`,
                "Relaxing evening walk and scenic views"
            ]
        })),
        budgetAllocation: fallbackBudget
    };
}
