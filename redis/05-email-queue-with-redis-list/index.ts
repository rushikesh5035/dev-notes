import express from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

//
const QUEUE_KEY = "queue:email"; // standard naming convention for Redis keys or email_queue

app.post("/emails", async (req, res) => {
  // job (task) to be added to the queue
  const job = {
    to: req.body.to,
    subject: req.body.subject || "No Subject",
    body: req.body.body || "No Content",
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(QUEUE_KEY, JSON.stringify(job)); // add job to the queue (list) using LPUSH (left push, right push is RPUSH)

  res.status(201).json({ queued: true, job });
});

app.get("/emails/process-one", async (req, res) => {
  const rawJob = await redis.rpop(QUEUE_KEY); // get the next job from the queue (list) using RPOP (right pop, left pop is LPOP)

  const job = JSON.parse(rawJob || "{}"); // parse the job, if rawJob is null, parse an empty object

  res.json({ message: "Email sent", job });
});

app.get("/emails/process-all", async (req, res) => {
  const jobs: any[] = [];
  while (true) {
    const rawJob = await redis.rpop(QUEUE_KEY);

    if (!rawJob) break; // if no more jobs, exit the loop

    const job = JSON.parse(rawJob); // parse the job

    jobs.push(job); // add the job to the list of processed jobs
  }
  res.json({ message: "All emails sent", jobs });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
