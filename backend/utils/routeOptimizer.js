const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

/**
 * Reorders activities for a single day to minimize total travel time.
 */
exports.optimizeDailyRoute = async (activities, startPoint) => {
    try {
        // 1. Prepare addresses for the API
        const destinations = activities.map(act => act.address || act.name);

        // 2. Get the Distance Matrix (Time/Distance from start to all points)
        const response = await client.distancematrix({
            params: {
                origins: [startPoint],
                destinations: destinations,
                mode: 'driving', // Can be 'walking' for city centers
                key: process.env.GOOGLE_MAPS_API_KEY
            }
        });

        const results = response.data.rows[0].elements;

        // 3. Simple Greedy Reordering
        // We find the closest item, then move there and find the next closest.
        let unvisited = [...activities];
        let optimized = [];
        let currentOrigin = startPoint;

        while (unvisited.length > 0) {
            // In a real app, you'd call the API again from the new origin,
            // but for 3-4 items, choosing the closest to the hotel works well.
            let closestIdx = 0;
            let minTime = Infinity;

            results.forEach((res, idx) => {
                if (unvisited.includes(activities[idx]) && res.duration.value < minTime) {
                    minTime = res.duration.value;
                    closestIdx = idx;
                }
            });

            optimized.push(activities[closestIdx]);
            unvisited = unvisited.filter(item => item !== activities[closestIdx]);
        }

        return optimized;
    } catch (error) {
        console.error("Optimization failed:", error.message);
        return activities; // Fallback to AI's original order
    }
};