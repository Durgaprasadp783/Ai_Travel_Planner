const axios = require('axios');

const API_URL = process.env.API_URL || 'http://127.0.0.1:5000/api';

// Generate a random user to avoid duplicate key errors
const testUser = {
    name: "Test User Fix",
    email: `test_fix_${Date.now()}@example.com`,
    password: "password123"
};

const tripRequest = {
    destination: "Paris",
    days: 3,
    budget: 1200,
    interests: ["Food", "Museums"],
    startDate: "2026-04-01",
    endDate: "2026-04-03",
    mode: "solo",
    peopleCount: 1
};

async function runTest() {
    console.log(`Starting test against ${API_URL}...`);

    let token;

    // 1. Authenticate (Register + Login)
    try {
        console.log("1. Registering user...");
        await axios.post(`${API_URL}/auth/register`, testUser);
        console.log("   User registered.");

        console.log("2. Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        token = loginRes.data.token;
        console.log("   Logged in successfully.");
    } catch (error) {
        console.error("   Authentication failed:", error.message);
        if (error.response) {
            console.error("   Status:", error.response.status);
            console.error("   Details:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("   Full error:", error);
        }
        return; // specific fail
    }

    // 2. Send the Request that was failing
    try {
        console.log("3. Sending POST /api/trips/generate...");
        console.log("   Payload:", JSON.stringify(tripRequest));

        const res = await axios.post(`${API_URL}/trips/generate`, tripRequest, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("\n✅ SUCCESS: Request succeeded with status", res.status);
        console.log("Response Body (Trip):", JSON.stringify(res.data, null, 2));

        if (res.data && res.data._id) {
            console.log("\nTrip ID:", res.data._id);
        }

    } catch (error) {
        console.error("\n❌ FAILED: Request failed.");
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error("   Error Body:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("   Error:", error.message);
        }
    }
}

runTest();
