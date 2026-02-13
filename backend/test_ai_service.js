require("dotenv").config();
const { getAIPlan } = require("./services/aiService");

const testTrip = {
    destination: "Paris",
    days: 3,
    budget: "Medium",
    interests: ["Art", "Food", "History"]
};

async function runTest() {
    try {
        console.log("Testing getAIPlan...");
        const plan = await getAIPlan(testTrip);
        console.log("Success! Generated Plan:");
        console.log(JSON.stringify(plan, null, 2));

        if (!plan.dailyPlan || !Array.isArray(plan.dailyPlan)) {
            console.error("FAILED: Response missing 'dailyPlan' array.");
            process.exit(1);
        }
        console.log("Validation Passed: 'dailyPlan' exists and is an array.");
    } catch (error) {
        console.error("Test Failed:", error.message);
        process.exit(1);
    }
}

runTest();
