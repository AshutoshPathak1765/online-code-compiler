const Queue = require("bull");

const jobQueue = new Queue("job-queue");

const NUM_WORKERS = 5;

const Job = require("./models/Job");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");

jobQueue.process(NUM_WORKERS, async ({ data }) => {
  //   console.log(data);
  const { id: jobId } = data;
  const job = await Job.findById(jobId);
  if (job === undefined) throw Error("job not found!");
  console.log("Fetched job", job);
  let output;
  try {
    if (job.language == "cpp") {
      output = await executeCpp(`./codes/${job.filePath}`);
    } else if (job.language == "py") {
      output = await executePy(`./codes/${job.filePath}`);
    }
    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;
    await job.save();
    // return res.status(200).json({ fileName, output, status: "SUCCESS" });
  } catch (error) {
    job["completedAt"] = new Date();
    job["status"] = "error";
    job["output"] = JSON.stringify(error);
    await job.save();
    // return res.status(500).json({ fileName, error, status: "ERROR" });
  }
  return true;
});

jobQueue.on("failed", (error) => {
  console.log(error.data.id, "failed", error.failedReason);
});

const addJobToQueue = async (jobId) => {
  await jobQueue.add({ id: jobId });
};

module.exports = {
  addJobToQueue,
};
