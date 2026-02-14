const axios = require('axios');
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

async function reproducePostmanRequest() {
    const API_URL = "http://localhost:5001/api";

    console.log("🚀 Starting Postman Reproduction Script...");

    try {
        // 1. Login to get JWT Token
        console.log("🔑 Logging in to get token...");
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: "test@example.com", // Ensure this user exists or register first
            password: "password123"
        });

        const token = loginResponse.data.token;
        console.log("✅ Token received:", token.substring(0, 10) + "...");

        // 2. Send Generate Trip Request
        console.log("🌍 Sending Generate Trip Request...");

        const payload = {
            destination: "Paris",
            days: 3,
            startDate: "2024-06-01",
            endDate: "2024-06-04",
            budget: 2000,
            interests: ["Museums", "Food"]
        };

        const generateResponse = await axios.post(`${API_URL}/trips/generate`, payload, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "X-API-Key": process.env.GEMINI_API_KEY // Adding this just in case, though backend doesn't seem to check it for client
            }
        });

        console.log("🎉 Response Received (Status 200/201):");
        console.log(JSON.stringify(generateResponse.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error("❌ Request Failed:", error.response.status, error.response.data);

            // Check if user needs to be registered
            if (error.response.data.message === "Invalid credentials" || error.response.status === 400) {
                console.log("⚠️ Login failed. Attempting to register test user...");
                try {
                    await axios.post(`${API_URL}/auth/register`, {
                        name: "Test User",
                        email: "test@example.com",
                        password: "password123"
                    });
                    console.log("✅ User registered. Please re-run the script.");
                } catch (regError) {
                    console.error("❌ Registration failed:", regError.response?.data || regError.message);
                }
            }
        } else {
            console.error("❌ Network/Script Error:", error.message);
        }
    }
}

reproducePostmanRequest();
