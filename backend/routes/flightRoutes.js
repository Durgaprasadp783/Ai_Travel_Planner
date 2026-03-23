const express = require("express");
const router = express.Router();
const axios = require("axios");

const API_KEY = process.env.AVIATION_API_KEY || 'your_api_key_here';

// GET /api/flights?from=DEL&to=BOM
router.get("/", async (req, res) => {
  try {
    const { from, to } = req.query;

    const params = {
      access_key: API_KEY,
    };
    if (from) params.dep_iata = from;
    if (to) params.arr_iata = to;

    let response = await axios.get(
      `http://api.aviationstack.com/v1/flights`,
      { params }
    );

    let flights = response.data.data;

    // Smart Fallback: If no direct flights are active right now, fetch ANY active departures from the origin
    if ((!flights || flights.length === 0) && from) {
      delete params.arr_iata; // Remove destination constraint
      response = await axios.get(
        `http://api.aviationstack.com/v1/flights`,
        { params }
      );
      flights = response.data.data;
    }

    if ((!flights || flights.length === 0) && to) {
      delete params.dep_iata; // Try fetching arrivals to destination
      params.arr_iata = to;
      response = await axios.get(
        `http://api.aviationstack.com/v1/flights`,
        { params }
      );
      flights = response.data.data;
    }

    // Failsafe in case Aviation API limit is reached or invalid response
    if (!flights || !Array.isArray(flights)) {
        return res.json([]);
    }

    const formatted = flights.map(f => ({
      airline: f.airline?.name || "Unknown Airline",
      flight: f.flight?.iata || "N/A",
      from: f.departure?.airport || from,
      to: f.arrival?.airport || to,
      departure: f.departure?.scheduled || "TBD",
      arrival: f.arrival?.scheduled || "TBD",
      status: f.flight_status || "scheduled",
      dep_lat: f.departure?.latitude || 28.6139,
      dep_lng: f.departure?.longitude || 77.2090,
      arr_lat: f.arrival?.latitude || 19.0760,
      arr_lng: f.arrival?.longitude || 72.8777,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Flight API Error:", err.message);
    res.status(500).json({ error: "Flight fetch failed" });
  }
});

module.exports = router;
