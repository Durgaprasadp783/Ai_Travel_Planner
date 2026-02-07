const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    budget: {
        type: Number
    },
    itinerary: {
        type: Object // Flexible object to store the AI-generated plan
    }
}, { timestamps: true });

module.exports = mongoose.model("Trip", TripSchema);