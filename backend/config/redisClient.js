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

let isRedisReady = false;

redisClient.on("error", (err) => {
    // Suppress logs slightly to avoid flooding but keep track of state
    if (redisClient.isOpen && isRedisReady) {
        console.error("Redis Client Error:", err.message);
    }
});

(async () => {
    try {
        await redisClient.connect();
        console.log("✅ Redis Connected");
        isRedisReady = true;
    } catch (err) {
        console.error("❌ Redis Connection Failed. Application will run without caching.");
        isRedisReady = false;
    }
})();

module.exports = { redisClient, isRedisReady: () => isRedisReady };

