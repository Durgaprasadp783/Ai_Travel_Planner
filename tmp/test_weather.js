const https = require('https');

const apiKey = "3bb16f3d068cbbe4b83a5949f2f68883";
const destination = "Paris, France";
const startDate = "2026-03-25";
const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(destination)}/${startDate}?unitGroup=metric&key=${apiKey}&contentType=json`;

console.log("Testing URL:", url);

https.get(url, (res) => {
    console.log("Status Code:", res.statusCode);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Raw Response (first 1000 chars):", data.substring(0, 1000));
    });
}).on('error', (err) => {
    console.error("Error:", err.message);
});
