// File: src/lib/api.ts

// Replace with your actual backend URL if different
const BACKEND_URL = "http://localhost:5000";

export const apiRequest = async (endpoint: string, options: any = {}) => {
    const url = `${BACKEND_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            ...options,
        });

        // Validates that the response is JSON to prevent the common "<!DOCTYPE" error
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned HTML instead of JSON. Is the backend running?");
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "API request failed");
        }

        return await response.json();
    } catch (error: any) {
        // Catch network errors like 'Connection Refused'
        if (error.message === "Failed to fetch") {
            throw new Error("Cannot connect to backend. Please ensure your Node server is running.");
        }
        throw error;
    }
};