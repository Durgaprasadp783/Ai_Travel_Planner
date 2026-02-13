require("dotenv").config();
const { getAIPlan } = require("./services/aiService");

const testTrip = {
    destination: "Tokyo",
    days: 3,
    budget: "High",
    interests: ["Anime", "Technology", "Sushi"]
};

async function runTest() {
    console.log("Starting integration test with gemini-2.5-flash...");
    try {
        const plan = await getAIPlan(testTrip);
        console.log("Successfully generated plan!");
        console.log("Plan Overview:", plan.overview);
        if (plan.dailyPlan && plan.dailyPlan.length === 3) {
            console.log("Validation Passed: dailyPlan has 3 days.");
        } else {
            console.error("Validation Failed: dailyPlan structure incorrect or length mismatch.");
            console.log(JSON.stringify(plan, null, 2));
            process.exit(1);
        }
        const fs = require('fs');

    } catch (error) {
        console.error("Integration Test Failed:", error.message);
        fs.writeFileSync('test_error.log', `Error: ${error.message}\nStack: ${error.stack}`);
        process.exit(1);
    }
}

runTest();
