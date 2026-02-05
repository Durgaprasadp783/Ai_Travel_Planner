const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    days: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Trip", tripSchema);
