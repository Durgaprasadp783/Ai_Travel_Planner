
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testUser = {
    name: "Test User",
    email: `testuser_${Date.now()}@example.com`,
    password: "password123"
};

const tripRequest = {
    destination: "Tokyo",
    days: 5,
    budget: "High",
    interests: ["Anime", "Sushi", "Technology"]
};

async function runTest() {
    try {
        console.log("1. Registering user...");
        try {
            await axios.post(`${API_URL}/auth/register`, testUser);
            console.log("User registered.");
        } catch (error) {
            // If user exists, that's fine, we'll login
            if (error.response && error.response.status === 400) {
                console.log("User might already exist, proceeding to login.");
            } else {
                throw error;
            }
        }

        console.log("2. Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        const token = loginRes.data.token;
        console.log("Logged in. Token:", token.substring(0, 20) + "...");

        console.log("3. Generating AI Trip...");
        const aiRes = await axios.post(`${API_URL}/ai/generate`, tripRequest, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("\n--- AI RESPONSE ---");
        console.log(aiRes.data);
        console.log("-------------------\n");
        console.log("Test Passed!");

    } catch (error) {
        console.error("Test Failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

runTest();
