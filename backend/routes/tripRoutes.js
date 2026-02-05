const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");

router.get("/trips", async (req, res) => {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
});

router.post("/trips", async (req, res) => {
    const newTrip = new Trip(req.body);
    await newTrip.save();
    res.json(newTrip);
});

module.exports = router;
