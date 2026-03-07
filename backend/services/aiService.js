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
    const { totalBudget, days, destination, mode = 'solo', peopleCount = 1, interests } = tripData;

    try {
        // 1. Get optimized budget & mode configuration
        const budgetInfo = calculateAllocation(totalBudget, days, mode);
        const modeConfig = travelModes[mode] || travelModes['solo'];

        // 2. Build Dynamic System Persona & Tone
        const tone = (mode === 'business' || mode === 'work') ? 'professional and efficient' : 'excited and adventurous';

        const systemInstruction = `You are a world-class travel expert specializing in ${mode} travel for a group of ${peopleCount} member(s). 
        Your tone is ${tone}.
        Persona Context: ${modeConfig.prompt}
        CRITICAL RULE: Only suggest locations and restaurants that strictly align with the "${mode}" persona and are appropriate for a group size of ${peopleCount}.`;

        // 3. Construct the full prompt
        const basePrompt = buildTravelPrompt(tripData);
        const prompt = `
            ${systemInstruction}
            
            ${basePrompt}

            STRICT BUDGET CONSTRAINTS (Values in USD):
            - Travel Tier: ${budgetInfo.tier}
            - Max Nightly Hotel Cost: $${budgetInfo.breakdown.avgNightlyRate}
            - Max Daily Food Spend: $${budgetInfo.breakdown.dailyFood}
            - Max Daily Activity Spend: $${budgetInfo.breakdown.dailyActivities}
            
            IMPORTANT: Return the response in valid JSON format only. 
            Ensure "dailyPlan" contains exactly ${days} days.
        `;

        // 4. Generate Content
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" } // Force JSON mode
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("--- 🤖 GEMINI RESPONSE RECEIVED ---");

        // 5. Parse and Return
        const parsedData = extractJSONObject(responseText);

        return {
            ...parsedData,
            budgetAllocation: budgetInfo,
            travelMode: mode
        };

    } catch (error) {
        console.error("Gemini AI Service Error:", error.message);
        // Fallback to Mock Data if API fails
        return getMockData(destination, days, totalBudget, mode);
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
    console.warn("⚠️ Switching to Mock Data.");
    const fallbackBudget = calculateAllocation(budget || 1000, days || 3, mode);

    const activities = [
        ["Explore Downtown", "Visit Local Landmark", "Evening Cultural Walk"],
        ["Historic District", "Regional Market", "Live Music Venue"],
        ["Nature Park", "Scenic Lunch", "Sunset Viewpoint"]
    ];

    return {
        destination: destination || "Selected City",
        duration: `${days || 3} days`,
        budgetTier: fallbackBudget.tier,
        overview: "A curated itinerary featuring top-rated local spots.",
        dailyPlan: Array.from({ length: days || 3 }, (_, i) => ({
            day: i + 1,
            title: `Day ${i + 1}: Discover ${destination || 'the area'}`,
            activities: activities[i % activities.length]
        })),
        budgetAllocation: fallbackBudget
    };
}