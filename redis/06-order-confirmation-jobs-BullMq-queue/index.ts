import express from "express";
import Redis from "ioredis";
import { emailQueue } from "./queue";

const app = express();
app.use(express.json());

const redis = new Redis();

app.post("/welcome-email", async (req, res) => {
  const { email } = req.body;

  const job = await emailQueue.add(
    "send-welcome-email",
    {
      to: req.body.to,
      name: req.body.name || "Learner",
    },
    {
      attempts: 3, // Retry up to 3 times if the job fails
      backoff: {
        type: "exponential",
        delay: 2000, // Initial delay of 2 seconds before retrying
      },
    },
  );

  res.json({ message: "Welcome email job added to the queue", jobId: job.id });
});

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
