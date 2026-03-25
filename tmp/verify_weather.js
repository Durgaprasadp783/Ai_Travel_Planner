const { getForecast } = require("./backend/services/weatherService");
require('dotenv').config({ path: './backend/.env' });

async function test() {
    console.log("Testing getForecast with OWM Refactor...");
    const destination = "Paris, France";
    const startDate = "2026-03-25";
    const days = 3;
    const coords = [48.8566, 2.3522];

    const results = await getForecast(destination, startDate, days, coords);
    if (results) {
        console.log("Success! Forecast days:", results.length);
        console.log("Sample day:", JSON.stringify(results[0], null, 2));
    } else {
        console.log("Failed to get forecast.");
    }
}

test();
