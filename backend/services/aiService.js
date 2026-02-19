const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildTravelPrompt } = require("./promptBuilder");
const { calculateAllocation } = require("./budgetService");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Main service function to generate a structured AI itinerary.
 * Combines budget calculation with Gemini AI generation.
 */
exports.getAIPlan = async (tripData) => {
    const { totalBudget, days, destination } = tripData;

    try {
        // 1. Get the optimized budget breakdown
        const budgetInfo = calculateAllocation(totalBudget, days);

        // 2. Build the prompt 
        // We combine the base prompt with the specific budget constraints
        const basePrompt = buildTravelPrompt(tripData);
        const prompt = `
            ${basePrompt}

            STRICT BUDGET CONSTRAINTS (Values in USD):
            - Travel Tier: ${budgetInfo.tier}
            - Max Nightly Hotel Cost: $${budgetInfo.breakdown.avgNightlyRate}
            - Max Daily Food Spend: $${budgetInfo.breakdown.dailyFood}
            - Max Daily Activity Spend: $${budgetInfo.breakdown.dailyActivities}
            
            IMPORTANT: Ensure all suggested locations and restaurants fit within these individual price caps. 
            Return the response in valid JSON format.
        `;

        // 3. Initialize Model and Generate Content
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 4. Extract and Parse JSON
        const start = responseText.indexOf('{');
        const end = responseText.lastIndexOf('}');

        if (start === -1 || end === -1 || start >= end) {
            throw new Error("No valid JSON found in AI response");
        }

        const cleanJson = responseText.substring(start, end + 1);
        const parsedData = JSON.parse(cleanJson);

        // Return parsed data merged with budget info for the frontend
        return {
            ...parsedData,
            budgetAllocation: budgetInfo
        };

    } catch (error) {
        console.error("Gemini AI Service Error:", error.message);
        console.warn("⚠️ Switching to Mock Data for demonstration due to API failure.");

        // Fallback: Calculate budget info even for mock data if possible
        const fallbackBudget = calculateAllocation(totalBudget || 1000, days || 3);

        // return mock data so the app doesn't crash
        return {
            destination: destination || "Unknown",
            duration: `${days || 3} days`,
            budgetTier: fallbackBudget.tier,
            overview: "This is a generated itinerary based on your preferences (Mock Data due to API failure/timeout).",
            dailyPlan: Array.from({ length: days || 3 }, (_, i) => ({
                day: i + 1,
                title: `Day ${i + 1} exploration in ${destination || 'the city'}`,
                activities: [
                    "Visit a highly-rated local landmark",
                    `Lunch within $${fallbackBudget.breakdown.dailyFood / 2} budget`,
                    "Evening cultural walk"
                ]
            })),
            budgetAllocation: fallbackBudget
        };
    }
};

/**
 * Helper for direct model testing or raw text responses
 */
exports.getGeminiResponse = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini raw response error:", error.message);
        throw error;
    }
};