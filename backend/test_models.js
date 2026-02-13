require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-1.0-pro"
];

async function testModels() {
    console.log("Testing models with key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");

    for (const modelName of modelsToTest) {
        console.log(`\nTesting: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            console.log(`SUCCESS: ${modelName} works!`);
            console.log("Response:", result.response.text());
            return; // Found one!
        } catch (error) {
            console.log(`FAILED: ${modelName}`);
            // console.log(error.message); 
            if (error.message.includes("404")) {
                console.log("-> 404 Not Found (Invalid model name)");
            } else if (error.message.includes("400")) {
                console.log("-> 400 Bad Request (Invalid Key potentially)");
            } else {
                console.log("-> Other error:", error.message);
            }
        }
    }
    console.log("\nAll models failed.");
}

testModels();
