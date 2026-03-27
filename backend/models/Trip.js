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
        originCoordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        },
        destinationCoordinates: {
            type: [Number], // [longitude, latitude]
            required: false
        },
        origin: {
            type: String,
            required: false
        },
        startDate: {
            type: Date,
            required: false
        },
        endDate: {
            type: Date,
            required: false
        },
        days: {
            type: Number,
            required: true
        },
        budget: {
            type: Number,
            required: true
        },
        budgetTier: {
            type: String,
            required: false
        },
        mode: {
            type: String,
            enum: ['solo', 'family', 'friends', 'business', 'couples'],
            required: false
        },
        peopleCount: {
            type: Number,
            required: false
        },
        interests: {
            type: [String],
            default: []
        },
        currency: {
            type: String,
            default: 'USD'
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