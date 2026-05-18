import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";

const app = express();

// redis client
export const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
);

app.get("/redis", async (req, res) => {
  const reply = await redis.ping();
  res.send(`Redis replied: ${reply}`);
});

app.get("/mongo", async (req, res) => {
  try {
    const url = process.env.MONGO_URL || "mongodb://localhost:27017/test";

    if (!mongoose.connection.readyState) {
      await mongoose.connect(url);
    }

    res.json({
      mongo: "connected",
      database: mongoose.connection.name,
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).send("Failed to connect to MongoDB");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
