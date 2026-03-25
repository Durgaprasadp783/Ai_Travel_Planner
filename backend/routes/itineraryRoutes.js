const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/", async (req, res) => {
  const { city, days, weather, flights, from, to } = req.body;

  // Example simple AI logic
  const itinerary = [];

  for (let i = 1; i <= days; i++) {
    if (weather && weather.temp > 35) {
      itinerary.push({
        day: i,
        plan: "Indoor places (museums, malls)"
      });
    } else {
      itinerary.push({
        day: i,
        plan: "Outdoor sightseeing"
      });
    }
  }
  if (flights && flights.length > 0 && itinerary.length > 0) {
    itinerary[0].plan = `Travel from ${from || 'origin'} to ${to || city}`;
    itinerary[0].flight = flights[0]; // attach selected flight
  }

  res.json(itinerary);
});

module.exports = router;
