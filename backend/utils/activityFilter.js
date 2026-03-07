const travelModes = require('../config/travelModes');

/**
 * Scans activities for forbidden keywords based on travel mode.
 */
exports.sanitizeItinerary = (itinerary, mode) => {
    const modeConfig = travelModes[mode];
    if (!modeConfig || !modeConfig.blacklist) return itinerary;

    itinerary.days = itinerary.days.map(day => ({
        ...day,
        places: day.places.map(place => {
            const description = (place.location || place.name || "").toLowerCase();

            // Check if any blacklisted word exists in the activity text
            const isForbidden = modeConfig.blacklist.some(word => description.includes(word));

            if (isForbidden) {
                console.warn(`FILTERED: Found forbidden activity for ${mode} mode. Replacing...`);
                return {
                    ...place,
                    name: modeConfig.fallbackActivity,
                    location: "Selected as a more appropriate alternative for your travel style.",
                    filtered: true // Flag this for the frontend to show a badge if you want
                };
            }
            return place;
        })
    }));

    return itinerary;
};