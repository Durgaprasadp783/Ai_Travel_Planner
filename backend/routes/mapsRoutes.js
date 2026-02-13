const express = require("express");
const router = express.Router();
const mapsService = require("../services/mapsService");
console.log("🔥 MAPS ROUTES FILE LOADED 🔥");


// 🔹 Search Places
router.get("/places", async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
        }

        const places = await mapsService.getPlaces(query);

        const formattedPlaces = places.map(place => ({
            name: place.name,
            address: place.formatted_address,
            location: place.geometry.location,
            place_id: place.place_id
        }));

        res.json(formattedPlaces);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch places" });
    }
});


// 🔹 Get Directions
router.get("/directions", async (req, res) => {
    try {
        const { origin, destination } = req.query;
        const routes = await mapsService.getDirections(origin, destination);
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch directions" });
    }
});

module.exports = router;
