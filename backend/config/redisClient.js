const { createClient } = require("redis");

const redisClient = createClient({
    url: "redis://localhost:6379",
    // Prevent client from crashing on reconnect attempts
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 5) return new Error("Redis reconnection failed");
            return Math.min(retries * 50, 500);
        }
    }
});

redisClient.on("error", (err) => {
    // Suppress logs slightly to avoid flooding but keep track of state
    if (redisClient.isOpen) {
        console.error("Redis Client Error:", err.message);
    }
});

(async () => {
    try {
        await redisClient.connect();
        console.log("✅ Redis Connected");
    } catch (err) {
        console.error("⚠️ Redis Connection Failed. Caching will be disabled.");
    }
})();

module.exports = redisClient;
