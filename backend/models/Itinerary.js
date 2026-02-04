const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    time: String,
    description: {
        type: String,
        required: true
    },
    location: String,
    cost: Number,
    category: String
});

const itinerarySchema = new mongoose.Schema({
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    dayNumber: {
        type: Number,
        required: true
    },
    date: {
        type: Date
    },
    activities: [activitySchema]
});

// Compound index to ensure unique day numbers per trip
itinerarySchema.index({ trip: 1, dayNumber: 1 }, { unique: true });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);
module.exports = Itinerary;
