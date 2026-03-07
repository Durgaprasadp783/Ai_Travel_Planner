const axios = require('axios');

/**
 * Decorates the generated itinerary with exact Google Maps location data (Lat, Lng, Address, Place ID).
 */
exports.attachExactLocations = async (itinerary) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ Google Maps API Key missing. Skipping location decoration.");
        return itinerary;
    }

    if (!itinerary || !itinerary.dailyPlan) return itinerary;

    for (let day of itinerary.dailyPlan) {
        if (!Array.isArray(day.activities)) continue;

        // The AI might return activities as strings or objects. 
        // We'll normalize them to objects with location data.
        day.activities = await Promise.all(day.activities.map(async (activity) => {
            const activityName = typeof activity === 'string' ? activity : activity.name;

            try {
                // Find place from text to get geometry and formatted address
                const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(activityName)}&inputtype=textquery&fields=formatted_address,geometry,place_id,name&key=${apiKey}`;
                const response = await axios.get(url);

                if (response.data.candidates && response.data.candidates.length > 0) {
                    const place = response.data.candidates[0];
                    return {
                        name: activityName,
                        address: place.formatted_address,
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng,
                        placeId: place.place_id,
                        // Preserve existing properties if any (like description from AI)
                        ...(typeof activity === 'object' ? activity : {})
                    };
                }
            } catch (err) {
                console.error(`Map Data Error for "${activityName}":`, err.message);
            }

            // Fallback: return original activity if Google search fails
            return typeof activity === 'string' ? { name: activity } : activity;
        }));
    }

    return itinerary;
};
