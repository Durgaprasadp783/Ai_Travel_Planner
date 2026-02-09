const Trip = require("../models/Trip");
const { getAIPlan } = require("../services/aiService");

/* 1. CREATE AI-GENERATED TRIP */
exports.generateTrip = async (req, res) => {
    try {
        const { destination, startDate, endDate, days, budget } = req.body;

        // Get the AI-generated itinerary from your service
        const aiPlan = await getAIPlan(req.body);

        // Create the trip linked to the logged-in user
        const trip = await Trip.create({
            user: req.user.userId,      // ID from your auth middleware
            destination,
            days,
            startDate,
            endDate,
            budget,
            itinerary: aiPlan,     // The structured JSON from AI
        });

        res.status(201).json(trip);
    } catch (err) {
        console.error("Trip Generation Error:", err.message);
        res.status(500).json({ message: "Failed to generate and save trip" });
    }
};

/* 2. GET ALL USER TRIPS */
exports.getTrips = async (req, res) => {
    try {
        // Find trips where the 'user' field matches the current user's ID
        const trips = await Trip.find({ user: req.user.userId }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch trips" });
    }
};

/* 3. UPDATE TRIP */
exports.updateTrip = async (req, res) => {
    try {
        const updatedTrip = await Trip.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId }, // Ensure the user owns this trip
            req.body,
            { new: true, runValidators: true } // Returns the modified document
        );

        if (!updatedTrip) {
            return res.status(404).json({ message: "Trip not found or unauthorized" });
        }

        res.json(updatedTrip);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* 4. DELETE TRIP */
exports.deleteTrip = async (req, res) => {
    try {
        const deletedTrip = await Trip.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!deletedTrip) {
            return res.status(404).json({ message: "Trip not found or unauthorized" });
        }

        res.json({ message: "Trip deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};