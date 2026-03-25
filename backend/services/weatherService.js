// services/weatherService.js
const axios = require("axios");

exports.getForecast = async (destination, startDate, days) => {
    const apiKey = process.env.WEATHER_API_KEY;

    // Calculate endDate based on startDate and days
    let dateQuery = "";
    if (startDate) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + days - 1);
        const endDateStr = end.toISOString().split('T')[0];
        dateQuery = `/${startDate}/${endDateStr}`;
    }

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${destination}${dateQuery}?unitGroup=metric&key=${apiKey}&contentType=json`;

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