const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    startDate: Date,
    endDate: Date,
    budget: Number,
    itinerary: String
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);
