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
<<<<<<< Updated upstream
    // Suppress logs slightly to avoid flooding but keep track of state
    if (redisClient.isOpen) {
        console.error("Redis Client Error:", err.message);
    }
});
=======
    if (isRedisReady) {
        console.error("Redis Client Error", err);
    }
});

let isRedisReady = false;
>>>>>>> Stashed changes

(async () => {
    try {
        await redisClient.connect();
        console.log("✅ Redis Connected");
        isRedisReady = true;
    } catch (err) {
<<<<<<< Updated upstream
        console.error("⚠️ Redis Connection Failed. Caching will be disabled.");
=======
        console.error("❌ Redis Connection Failed. Application will run without caching.");
        isRedisReady = false;
>>>>>>> Stashed changes
    }
})();

module.exports = { redisClient, isRedisReady: () => isRedisReady };
