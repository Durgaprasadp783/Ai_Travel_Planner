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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 1. Find the JSON object within the response
        const start = responseText.indexOf('{');
        const end = responseText.lastIndexOf('}');

        if (start === -1 || end === -1 || start >= end) {
            throw new Error("No valid JSON found in AI response");
        }

        const cleanJson = responseText.substring(start, end + 1);

        // 2. Parse the string into a real JavaScript object
        const itinerary = JSON.parse(cleanJson);
        return itinerary;
    } catch (error) {
        console.error("Gemini AI Service Error:", error.message);
        throw new Error(`Failed to generate itinerary: ${error.message}`);
    }
};

// Keeping this for backward compatibility or direct model testing if needed
exports.getGeminiResponse = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini raw response error:", error.message);
        throw error;
    }
};