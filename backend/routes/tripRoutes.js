const express = require("express");
const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ============================
// POST — Create Trip
// ============================
router.post("/", authMiddleware, async (req, res) => {
    try {
        const newTrip = new Trip({
            ...req.body,
            user: req.user.userId
        });

        const savedTrip = await newTrip.save();
        res.status(201).json(savedTrip);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ============================
// GET — All Trips (My Trips)
// ============================
router.get("/", authMiddleware, async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.userId });
        res.json(trips);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ============================
// PUT — Update Trip
// ============================
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const updatedTrip = await Trip.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            req.body,
            { new: true }
        );

        if (!updatedTrip)
            return res.status(404).json({ message: "Trip not found" });

        res.json(updatedTrip);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ============================
// DELETE — Delete Trip
// ============================
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const deletedTrip = await Trip.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!deletedTrip)
            return res.status(404).json({ message: "Trip not found" });

        res.json({ message: "Trip deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
