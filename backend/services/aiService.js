const genAI = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
console.log("Gemini API key loaded:", !!apiKey);

const genAIClient = new genAI.GoogleGenerativeAI(apiKey);

const { buildTravelPrompt } = require("./promptBuilder");

async function getGeminiResponse(prompt) {
    try {
        const model = genAIClient.getGenerativeModel({ model: "gemini-flash-latest" });

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        return response;
    } catch (error) {
        console.error("Gemini error:", error.message);
        throw error;
    }
}

async function generateItinerary(input) {
    const prompt = buildTravelPrompt(input);
    const response = await getGeminiResponse(prompt);
    return response;
}

module.exports = { getGeminiResponse, generateItinerary };
