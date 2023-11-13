import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Button, Textarea } from "@nextui-org/react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import stubs from "./defaultStubs";
import moment from "moment";
function App() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  useEffect(() => {
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  }, []);
  const payload = {
    language,
    code,
  };
  // console.log(code);
  const handleSubmit = async () => {
    try {
      setJobId("");
      setOutput("");
      setStatus("");
      setJobDetails(null);
      const response = await axios.post("http://localhost:8000/run", payload);
      console.log(response);
      setJobId(response.data.JobId);
      let intervalId;
      intervalId = setInterval(async () => {
        const { data: dataRes } = await axios.get(
          "http://localhost:8000/status",
          { params: { id: response.data.JobId } }
        );
        console.log(dataRes);
        const { success, job, error } = dataRes;
        if (success) {
          const { status: jobStatus, output: jobOutput } = job;
          setStatus(jobStatus);
          setJobDetails(job);
          if (jobStatus == "pending") return;
          setOutput(jobOutput);
          clearInterval(intervalId);
        } else {
          setStatus("Error: Please retry!");
          console.error(error);
          clearInterval(intervalId);
          setOutput(error);
        }
      }, 1000);
    } catch ({ response }) {
      if (response) setOutput(response.data.error.stderr);
      else setOutput("Error connecting to server!");
    }
  };
  const handleChange = (value, event) => {
    setCode(value);
  };

  const setDefaultLanguage = () => {
    localStorage.setItem("default-language", language);
    console.log(`${language} set as default language`);
  };

  const renderTimeDetails = () => {
    if (!jobDetails) return "";
    let result = "";
    let { submittedAt, completedAt, startedAt } = jobDetails;
    submittedAt = moment(submittedAt).toString();
    result += `Submitted At: ${submittedAt}`;
    if (!completedAt || !startedAt) return result;
    const start = moment(startedAt);
    const end = moment(completedAt);
    const executionTime = end.diff(start, "seconds", true);
    console.log(executionTime);
    result += `Execution Time: ${executionTime}s`;
    return result;
  };

  return (
    <div
      className="dark text-foreground bg-background w-full h-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      <h1 className="text-center text-3xl font-bold">Online Code Compiler</h1>
      <div>
        <label htmlFor="language">Language: </label>
        <select
          value={language}
          onChange={(e) => {
            const response = window.confirm(
              "WARNING: Switching the language, will remove your current code. Do you wish to proceed?"
            );
            if (response) {
              setLanguage(e.target.value);
            }
          }}
        >
          <option value="cpp">C++</option>
          <option value="py">Python</option>
        </select>
      </div>
      <Button
        className="bg-zinc-500"
        style={{ padding: "15px" }}
        onClick={setDefaultLanguage}
      >
        Set Default
      </Button>
      <Editor
        theme="vs-dark"
        width="60vw"
        height="80vh"
        defaultLanguage={language}
        value={code}
        onChange={handleChange}
      />
      <Button onClick={handleSubmit} style={{ width: "10%", padding: "15px" }}>
        Submit
      </Button>
      <p>{status}</p>
      <p>{jobId && `JobId: ${jobId}`}</p>
      <p>{renderTimeDetails()}</p>
      {output && (
        <Textarea isReadOnly minRows={2} className="max-w-2xl" value={output} />
      )}
    </div>
  );
}

export default App;
