require('dotenv').config();
const { attachExactLocations } = require('./utils/locationService');

async function test() {
    console.log("🚀 Testing Location Decoration...");

    // Mock Itinerary with different structures
    const mockItinerary = {
        days: [
            {
                day: 1,
                activities: ["Eiffel Tower", "Louvre Museum"]
            }
        ]
    };

    const tripInfo = {
        origin: "London, UK",
        destination: "Paris, France"
    };

    try {
        const result = await attachExactLocations(mockItinerary, tripInfo);
        console.log("✅ Decoration Result:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("❌ Test Failed:", err.message);
    }
}

test();
