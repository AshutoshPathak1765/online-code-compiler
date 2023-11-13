const express = require("express");
const { generateFile } = require("./generateFile");
const Job = require("./models/Job");
const { addJobToQueue } = require("./jobQueue");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDb Connected Successfully"))
  .catch((err) => {
    console.log("Error connecting to MongoDb!", err);
    process.exit(1);
  });
app.get("/", (req, res) => {
  return res.json("Hello from Server");
});
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.get("/status", async (req, res) => {
  const jobId = req.query.id;
  console.log("status requested", jobId);
  if (jobId == undefined) {
    return res
      .status(400)
      .json({ success: false, error: "missing id query params" });
  }
  try {
    const job = await Job.findById(jobId);
    if (job === undefined)
      return res.status(404).json({ success: false, error: "invalid job id" });
    return res.status(200).json({ success: true, job });
  } catch (err) {
    return res.status(400).json({ success: false, error: JSON.stringify(err) });
  }
});
app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  if (code === undefined) {
    return res.status(400).json({ error: "Empty code body" });
  }
  let job;
  try {
    const fileName = await generateFile(language, code);
    job = await new Job({ language, filePath: fileName }).save();
    // console.log(fileName);
    const JobId = job["_id"];
    addJobToQueue(JobId);
    res.status(201).json({ success: true, JobId });
    // Handle compile time and runtime exceptions
    job["startedAt"] = new Date();
  } catch (err) {
    return res.status(500).json({ success: false, err: JSON.stringify(err) });
  }
});
const PORT = 8000 || process.env.port;
app.listen(PORT, () => console.log(`Server started at ${PORT}`));
