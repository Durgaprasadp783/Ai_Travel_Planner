const axios = require('axios');

async function test() {
    try {
        console.log("1. Registering user...");
        await axios.post('http://localhost:5000/api/auth/register', {
            name: "Test User",
            email: "test_verified@example.com",
            password: "password123"
        }).catch(err => console.log("User might already exist"));

        console.log("2. Logging in...");
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: "test_verified@example.com",
            password: "password123"
        });
        const token = loginRes.data.token;
        console.log("Token acquired.");

        console.log("3. Generating trip...");
        const tripRes = await axios.post('http://localhost:5000/api/trips/generate', {
            origin: "London",
            destination: "Paris",
            startDate: "2026-03-10",
            endDate: "2026-03-12",
            budget: 1000,
            mode: "solo",
            peopleCount: 1,
            interests: ["culture"]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("✅ Trip Generated Successfully!");
        console.log("Trip ID:", tripRes.data._id);
        console.log("Itinerary Daily Plan Length:", tripRes.data.itinerary.dailyPlan.length);
        console.log("Sample Activity:", JSON.stringify(tripRes.data.itinerary.dailyPlan[0].activities[0], null, 2));

    } catch (err) {
        console.error("❌ Test Failed!");
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Error:", err.message);
        }
    }
}

test();
