const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}
const executeCpp = (filepath) => {
  // 5a567155-dff1-4c93-9fa0-26fed4ab946e.cpp"
  // [5a567155-dff1-4c93-9fa0-26fed4ab946e,cpp]
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join('./outputs', `${jobId}.exe`); //output path


  return new Promise((resolve, reject) => {
    exec(
      `g++ ${filepath} -o ${outPath} && ${outPath}`,
      (error, stdout, stderr) => {
        if (error) reject({ error, stderr });
        if (stderr) reject(stderr);
        resolve(stdout);
      }
    );
  });
};

module.exports = {
  executeCpp,
};