const { createClient } = require("redis");

const redisClient = createClient({
    url: "redis://localhost:6379"
});

redisClient.on("error", (err) =>
    console.error("Redis Client Error", err)
);

(async () => {
    try {
        await redisClient.connect();
        console.log("✅ Redis Connected");
    } catch (err) {
        console.error("❌ Redis Connection Failed", err.message);
    }
})();

module.exports = redisClient;
