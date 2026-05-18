import Redis from "ioredis";

const subscriber1 = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
);
const subscriber2 = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
);

subscriber1.on("connect", () => {
  console.log("Subscriber 1 connected to Redis");
});

subscriber2.on("connect", () => {
  console.log("Subscriber 2 connected to Redis");
});

subscriber1.on("error", (error) => {
  console.error("Subscriber 1 Redis error:", error.message);
});

subscriber2.on("error", (error) => {
  console.error("Subscriber 2 Redis error:", error.message);
});

subscriber1.subscribe("notifications", (err, count) => {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
    return;
  }
  console.log(
    `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
  );
});

subscriber2.subscribe("notifications", (err, count) => {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
    return;
  }
  console.log(
    `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
  );
});

// Listen for messages on the subscribed channel
subscriber1.on("message", (channel, message) => {
  try {
    const parsed = JSON.parse(message);
    console.log("Subscriber 1 received message from", channel, ":", parsed);
  } catch {
    console.log("Subscriber 1 received non-JSON message from", channel, ":", message);
  }
});

subscriber2.on("message", (channel, message) => {
  try {
    const parsed = JSON.parse(message);
    console.log("Subscriber 2 received message from", channel, ":", parsed);
  } catch {
    console.log("Subscriber 2 received non-JSON message from", channel, ":", message);
  }
});
