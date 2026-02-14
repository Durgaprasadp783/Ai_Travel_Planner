const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildTravelPrompt } = require("./promptBuilder");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Main service function to generate a structured AI itinerary.
 * This is exported as getAIPlan to match your controller's requirements.
 */
exports.getAIPlan = async (tripData) => {
    try {
        const prompt = buildTravelPrompt(tripData);
        // Try the standard model first
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const start = responseText.indexOf('{');
        const end = responseText.lastIndexOf('}');

        if (start === -1 || end === -1 || start >= end) {
            throw new Error("No valid JSON found in AI response");
        }

        const cleanJson = responseText.substring(start, end + 1);
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini AI Service Error:", error.message);
        console.warn("⚠️ Switching to Mock Data for demonstration due to API failure.");

        // return mock data so the app doesn't crash
        return {
            destination: tripData.destination || "Unknown",
            duration: `${tripData.days} days`,
            budget: tripData.budget,
            overview: "This is a generated itinerary based on your preferences (Mock Data due to API limitations).",
            dailyPlan: Array.from({ length: tripData.days || 3 }, (_, i) => ({
                day: i + 1,
                title: `Day ${i + 1} Exploration`,
                activities: [
                    "Visit famous landmark",
                    "Enjoy local cuisine",
                    "Evening walk in the city center"
                ]
            }))
        };
    }
};

// Keeping this for backward compatibility or direct model testing if needed
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