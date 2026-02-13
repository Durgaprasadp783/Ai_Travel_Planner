const axios = require("axios");

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 🔹 Get Place Suggestions
exports.getPlaces = async (query) => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;

    const response = await axios.get(url, {
        params: {
            query: query,
            key: GOOGLE_API_KEY,
        },
    });

    return response.data.results;
};

// 🔹 Get Directions
exports.getDirections = async (origin, destination) => {
    const url = `https://maps.googleapis.com/maps/api/directions/json`;

    const response = await axios.get(url, {
        params: {
            origin: origin,
            destination: destination,
            key: GOOGLE_API_KEY,
        },
    });

    return response.data.routes;
};
