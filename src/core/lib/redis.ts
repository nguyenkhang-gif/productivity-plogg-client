import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 1,
  connectTimeout: 3000,
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.warn("[redis] connection error:", err.message);
});

export default redis;
