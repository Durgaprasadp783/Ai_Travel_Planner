const axios = require('axios');

/**
 * Geocodes an address string to Lng, Lat coordinates.
 */
const geocodeAddress = async (address, apiKey) => {
    if (!address) return null;
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const response = await axios.get(url);
        if (response.data.results && response.data.results.length > 0) {
            const loc = response.data.results[0].geometry.location;
            return [loc.lng, loc.lat]; // [longitude, latitude] for MongoDB
        }
    } catch (err) {
        console.error(`Geocoding Error for "${address}":`, err.message);
    }
    return null;
};

/**
 * Robustly extracts days from various itinerary structures.
 */
const extractDays = (itinerary) => {
    if (!itinerary) return [];
    if (Array.isArray(itinerary)) return itinerary;
    if (Array.isArray(itinerary.days)) return itinerary.days;
    if (Array.isArray(itinerary.itinerary)) return itinerary.itinerary;
    if (Array.isArray(itinerary.dailyPlan)) return itinerary.dailyPlan;

    const dayKeys = Object.keys(itinerary).filter(k => k.toLowerCase().includes('day'));
    if (dayKeys.length > 0) {
        return dayKeys.sort().map((k, i) => ({
            day: i + 1,
            title: k,
            activities: Array.isArray(itinerary[k]) ? itinerary[k] : []
        }));
    }
    return [];
};

/**
 * Decorates the generated itinerary with exact Google Maps location data.
 */
exports.attachExactLocations = async (itinerary, tripInfo = {}) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ Google Maps API Key missing. Skipping location decoration.");
        return { itinerary, originCoordinates: tripInfo.originCoordinates, destinationCoordinates: tripInfo.destinationCoordinates };
    }

    // A. Geocode Trip Origin/Destination if coordinates are missing
    let originCoordinates = tripInfo.originCoordinates;
    let destinationCoordinates = tripInfo.destinationCoordinates;

    if (!originCoordinates && tripInfo.origin) {
        originCoordinates = await geocodeAddress(tripInfo.origin, apiKey);
    }
    if (!destinationCoordinates && tripInfo.destination) {
        destinationCoordinates = await geocodeAddress(tripInfo.destination, apiKey);
    }

    if (!itinerary) return { itinerary, originCoordinates, destinationCoordinates };

    const daysList = extractDays(itinerary);
    if (!daysList || daysList.length === 0) return { itinerary, originCoordinates, destinationCoordinates };

    const updatedDays = await Promise.all(daysList.map(async (day) => {
        const activities = Array.isArray(day.activities) ? day.activities :
            (Array.isArray(day.places) ? day.places :
                (Array.isArray(day.plan) ? day.plan : []));

        if (activities.length === 0) return day;

        const updatedActivities = await Promise.all(activities.map(async (activity) => {
            const activityName = typeof activity === 'string' ? activity : (activity.name || activity.title);
            if (!activityName) return activity;

            try {
                const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(activityName)}&inputtype=textquery&fields=formatted_address,geometry,place_id,name&key=${apiKey}`;
                const response = await axios.get(url);

                if (response.data.candidates && response.data.candidates.length > 0) {
                    const place = response.data.candidates[0];
                    return {
                        ...(typeof activity === 'object' ? activity : { name: activityName }),
                        name: activityName,
                        address: place.formatted_address,
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng,
                        placeId: place.place_id
                    };
                }
            } catch (err) {
                console.error(`Map Data Error for "${activityName}":`, err.message);
            }
            return typeof activity === 'string' ? { name: activity } : activity;
        }));

        return {
            ...day,
            activities: updatedActivities,
            places: updatedActivities // for compatibility
        };
    }));

    // Reconstruct the itinerary object preserving its structure
    let finalItinerary = itinerary;
    if (itinerary.days) finalItinerary.days = updatedDays;
    else if (itinerary.dailyPlan) finalItinerary.dailyPlan = updatedDays;
    else if (itinerary.itinerary && Array.isArray(itinerary.itinerary)) finalItinerary.itinerary = updatedDays;
    else if (Array.isArray(itinerary)) finalItinerary = updatedDays;

    return {
        itinerary: finalItinerary,
        originCoordinates,
        destinationCoordinates
    };
};
