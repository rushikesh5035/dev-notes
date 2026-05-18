import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.post("/user/:id/json", async (req, res) => {
  await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body)); // Store the user profile as JSON string

  res.json({ success: true, savedAs: "JSON" });
});

app.get("/user/:id/json", async (req, res) => {
  const raw = await redis.get(`user:${req.params.id}:json`); // Retrieve the user profile as JSON string

  if (raw) {
    const userProfile = JSON.parse(raw); // Parse the JSON string back to an object
    res.json({ success: true, userProfile });
  } else {
    res.status(404).json({ success: false, message: "User profile not found" });
  }
});

app.post("/user/:id/hash", async (req, res) => {
  await redis.hset(`user:${req.params.id}:hash`, req.body); // Store the user profile as a Redis hash

  res.json({ success: true, savedAs: "hash" });
});

app.get("/user/:id/hash", async (req, res) => {
  const userProfile = await redis.hgetall(`user:${req.params.id}:hash`); // Retrieve entire user profile object from Redis hash

  // here we directly return the user profile object without parsing, since hgetall returns an object
  res.json({ success: true, userProfile });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
