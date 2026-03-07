const travelModes = require('../config/travelModes');

/**
 * Scans activities for forbidden keywords based on travel mode.
 */
exports.sanitizeItinerary = (itinerary, mode) => {
    const modeConfig = travelModes[mode];
    if (!modeConfig || !modeConfig.blacklist) return itinerary;

    itinerary.dailyPlan = itinerary.dailyPlan.map(day => ({
        ...day,
        activities: day.activities.map(activity => {
            const description = (activity.description || activity.name || "").toLowerCase();

            // Check if any blacklisted word exists in the activity text
            const isForbidden = modeConfig.blacklist.some(word => description.includes(word));

            if (isForbidden) {
                console.warn(`FILTERED: Found forbidden activity for ${mode} mode. Replacing...`);
                return {
                    ...activity,
                    name: modeConfig.fallbackActivity,
                    description: "Selected as a more appropriate alternative for your travel style.",
                    filtered: true // Flag this for the frontend to show a badge if you want
                };
            }
            return activity;
        })
    }));

    return itinerary;
};