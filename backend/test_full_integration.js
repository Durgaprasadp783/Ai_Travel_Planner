const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { getAIPlan } = require("./services/aiService");
const { getForecast } = require("./services/weatherService");
const { getPlaces } = require("./services/mapsService");

async function testFullIntegration() {
    console.log("🚀 Starting Full Integration Test...");
    console.log("Environment Check:", {
        GEMINI: !!process.env.GEMINI_API_KEY,
        GEMINI_KEY_START: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) : "MISSING",
        WEATHER: !!process.env.VISUAL_CROSSING_KEY,
        MAPS: !!process.env.GOOGLE_MAPS_API_KEY
    });

    const destination = "Paris";
    const days = 3;
    const budget = "2000 USD";
    const interests = ["Museums", "Food"];

    try {
        // 1. Get AI Plan
        console.log("🤖 Fetching AI Plan...");
        let aiPlan;
        try {
            aiPlan = await getAIPlan({ destination, days, budget, interests });
            console.log("✅ AI Plan Received");
        } catch (e) {
            console.warn("⚠️ AI Service Failed (likely API Key). Using Mock Data for testing merge logic.");
            aiPlan = {
                destination: "Paris",
                duration: "3 days",
                dailyPlan: [
                    { day: 1, activities: ["Eiffel Tower", "Louvre"] },
                    { day: 2, activities: ["Notre Dame", "Seine Cruise"] },
                    { day: 3, activities: ["Montmartre", "Sacre Coeur"] }
                ]
            };
        }

        // 2. Fetch External Data
        console.log("🌍 Fetching Weather and Maps...");
        const [weatherData, locationData] = await Promise.all([
            getForecast(destination, days),
            getPlaces(destination)
        ]);
        console.log("✅ External Data Received");

        // 3. Integrate Weather
        if (weatherData && aiPlan.dailyPlan) {
            console.log("☀️ Integrating Weather...");
            aiPlan.dailyPlan = aiPlan.dailyPlan.map((dayPlan, index) => {
                return {
                    ...dayPlan,
                    weather: weatherData[index] || "No forecast available"
                };
            });
        }

        // 4. Integrate Maps
        if (locationData && locationData.length > 0) {
            console.log("🗺️ Integrating Map Data...");
            aiPlan.locationInfo = locationData[0];
        }

        console.log("\n🎉 FINAL COMBINED OUTPUT 🎉");
        console.log(JSON.stringify(aiPlan, null, 2));

    } catch (error) {
        console.error("❌ Test Failed:", error);
        require("fs").writeFileSync("error_log.txt", error.stack || error.toString());
    }
}

testFullIntegration();
