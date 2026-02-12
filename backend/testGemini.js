require("dotenv").config();
const aiService = require("./services/aiService");

const { buildTravelPrompt } = require("./services/promptBuilder");

async function testGemini() {
    const input = {
        destination: "Paris",
        days: 3,
        budget: "Medium",
        interests: ["Food", "Museums"]
    };

    const prompt = buildTravelPrompt(input);
    try {
        const response = await aiService.getGeminiResponse(prompt);
        console.log("GEMINI RESPONSE:\n", response);
    } catch (e) {
        console.error("Test failed:", e.message);
        if (e.response) console.error("Response data:", JSON.stringify(e.response, null, 2));
    }
}

testGemini();
