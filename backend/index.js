const express = require("express");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
require("dotenv").config();
const app = express();
app.get("/", (req, res) => {
  return res.json("Hello from Server");
});
app.use(express.urlencoded({ extended: false }));
app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body;
  if (code === undefined) {
    return res.status(400).json({ error: "Empty code body" });
  }
  const filepath = await generateFile(language, code);
  const output = await executeCpp(filepath);
  return res.json({ filepath, output });
});
const PORT = 8000 || process.env.port;
app.listen(PORT, () => console.log(`Server started at ${PORT}`));
