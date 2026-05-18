// this is worker or we can say consumer which will consume the jobs from the queue and process them

import { Worker } from "bullmq";
import { connection } from "./queue";

const emailWorker = new Worker(
  // 3 parameters are required to create a worker(name, kaam and connection)
  "emails", // Name of queue
  async (job) => {
    console.log("Processing email job:", job.id, job.name, job.data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Email job completed:", job.id, job.name, job.data);
  }, // Kaam
  { connection }, // Connection
);

// Listen to completed events
emailWorker.on("completed", (job) => {
  console.log("Job completed:", job?.id, job?.name, job?.data);
});

// Listen to failed events
emailWorker.on("failed", (job, err) => {
  console.error("Job failed:", job?.id, job?.name, job?.data, err);
});
