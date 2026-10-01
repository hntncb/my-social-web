/*import { createClient } from "redis";

console.log("REDIS_URL:", process.env.REDIS_URL);

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("error", (error) => {
    console.error("redis client error:", error);
});

await redisClient.connect();

console.log("Redis connected");

export default redisClient;*/