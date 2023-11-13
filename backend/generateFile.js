const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const dirCodes = path.join(__dirname, "codes");
if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}
const generateFile = async (format, code) => {
  const jobId = uuid();
  const filename = `${jobId}.${format}`;
  const filepath = path.join(dirCodes, filename);
  await fs.writeFileSync(filepath, code);
  return filename; //we only need the generated filename because path will be handled manually.
};

module.exports = {
  generateFile,
};
