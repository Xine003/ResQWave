const Redis = require("ioredis");

const redis = new Redis(
    process.env.REDIS_URL || {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

redis.on("connect", () => console.log("Redis Connected"));
redis.on("Error", (err) => console.error("Redis Error", err));

module.exports = redis;