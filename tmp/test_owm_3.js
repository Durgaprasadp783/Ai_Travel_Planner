const https = require('https');

const apiKey = "3bb16f3d068cbbe4b83a5949f2f68883";
const lat = 48.8566;
const lon = 2.3522;
// One Call 3.0
const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&exclude=minutely,hourly`;

console.log("Testing URL (OWM One Call 3.0):", url);

https.get(url, (res) => {
    console.log("Status Code:", res.statusCode);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Raw Response:", data.substring(0, 500));
    });
}).on('error', (err) => {
    console.error("Error:", err.message);
});
