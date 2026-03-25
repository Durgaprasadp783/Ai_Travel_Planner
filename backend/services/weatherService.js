// services/weatherService.js
const axios = require("axios");

exports.getForecast = async (destination, startDate, days, coordinates = null) => {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
        console.error("WEATHER_API_KEY is missing in .env");
        return null;
    }

    let url = "";
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
        // Use coordinates if preferred/available
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates[0]}&lon=${coordinates[1]}&appid=${apiKey}&units=metric`;
    } else {
        // Fallback to destination name
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(destination)}&appid=${apiKey}&units=metric`;
    }

    try {
        const response = await axios.get(url);

        if (!response.data || !response.data.list) return null;

        // OWM 2.5 Forecast gives 5 days/3 hours (40 timestamps)
        // We need to pick one representative entry per day (ideally around noon)
        const dailyData = {};
        
        response.data.list.forEach(entry => {
            const date = entry.dt_txt.split(" ")[0]; // Get YYYY-MM-DD
            const time = entry.dt_txt.split(" ")[1]; // Get HH:mm:ss
            
            // Prefer 12:00:00, or the first one we find for that day
            if (!dailyData[date] || time === "12:00:00") {
                dailyData[date] = {
                    date: date,
                    avgTemp: Math.round(entry.main.temp),
                    condition: entry.weather[0].description,
                    icon: entry.weather[0].icon, // e.g. "04d"
                    chanceOfRain: entry.pop ? Math.round(entry.pop * 100) : 0
                };
            }
        });

        // Convert object back to array and sort by date
        return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)).slice(0, days);
        
    } catch (error) {
        console.error("OpenWeatherMap API Error:", error.response?.data || error.message);
        return null;
    }
};