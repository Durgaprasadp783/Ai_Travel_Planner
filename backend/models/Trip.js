const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },
        destination: {
            type: String,
            required: true
        },
        days: {
            type: Number,
            required: true
        },
        budget: {
            type: Number,
            required: true
        },
        itinerary: {
            type: Object,
            required: true
        }
    },
    { timestamps: true }
);

tripSchema.index({ destination: 1 });
tripSchema.index({ userId: 1 });
tripSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Trip", tripSchema);