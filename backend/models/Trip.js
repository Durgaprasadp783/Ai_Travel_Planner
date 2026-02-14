const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    // Linking the trip to a specific User document in your database
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Basic travel details
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
        type: String
    },
    // To store the complex AI-generated plan (JSON/Object)
    itinerary: {
        type: Object
    }
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);