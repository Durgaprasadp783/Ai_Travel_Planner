const axios = require("axios");

async function getOptimizedRoute(origin, destination) {
  const res = await axios.get(
    "https://maps.googleapis.com/maps/api/directions/json",
    {
      params: {
        origin,
        destination,
        key: process.env.GOOGLE_MAP_KEY,
      },
    }
  );

  return res.data.routes[0];
}

module.exports = getOptimizedRoute;
