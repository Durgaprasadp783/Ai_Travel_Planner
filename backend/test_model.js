const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init to access client? No, need to find how to list.
        // actually the SDK might not expose listModels directly on the main class easily in all versions.
        // Let's try to use the model that usually works: gemini-pro
        console.log("Checking gemini-pro...");
        const result = await model.generateContent("Test");
        console.log("gemini-pro works: " + result.response.text());
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
