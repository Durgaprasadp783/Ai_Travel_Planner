// services/weatherService.js
const axios = require("axios");

exports.getForecast = async (destination, days) => {
    const apiKey = process.env.VISUAL_CROSSING_KEY;

    // Visual Crossing Timeline API (Metric units)
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${destination}?unitGroup=metric&key=${apiKey}&contentType=json`;

    try {
        const response = await axios.get(url);

        if (!response.data || !response.data.days) return null;

        // We map the Visual Crossing data to match your previous schema
        return response.data.days.slice(0, days).map(day => ({
            date: day.datetime,
            avgTemp: day.temp,
            condition: day.conditions,
            icon: day.icon, // Visual Crossing returns icon names (e.g., "rain", "partly-cloudy-day")
            chanceOfRain: day.precipprob // Probability of precipitation
        }));
    } catch (error) {
        // Detailed error logging for debugging in your terminal
        console.error("Visual Crossing API Error:", error.response?.data || error.message);
        return null;
    }
};