import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

// Publisher client for sending events to Redis channels.
const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

publisher.on("connect", () => {
  console.log("Publisher connected to Redis");
});

publisher.on("error", (error) => {
  console.error("Publisher Redis error:", error.message);
});

app.post("/notifications", async (req, res) => {
  try {
    const payload = {
      title: req.body.title || "Default Title",
      createdAt: new Date().toISOString(),
    };

    // Number of clients subscribed to this channel at publish time.
    const receivers = await publisher.publish(
      "notifications",
      JSON.stringify(payload),
    );

    res.status(200).json({
      message: `Notification sent to ${receivers} subscribers`,
      status: 200,
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      message: `Failed to send notification: ${message}`,
      status: 500,
      success: false,
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
