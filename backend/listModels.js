require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // The SDK doesn't expose listModels directly easily in older versions, 
        // but let's try the fetch approach or check if the genAI instance has it.
        // Actually recent SDK versions might not have a direct helper on the main class 
        // that is documented simply. 
        // However, let's try to use the raw fetch to the API if needed.
        // But wait, the error message said: "Call ListModels to see the list of available models".

        // Let's try to just fetch it manually since we have the key.
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found or error:", data);
        }

    } catch (err) {
        console.error("List models failed:", err);
    }
}

listModels();
