import React, { useEffect, useState } from "react";

const PORT = 3000;

const MicrophoneInput = () => {
  const [output, setOutput] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    readOutput("Recording started, please speak now.");
    console.log("Start recording initiated.");
    fetch(`http://localhost:${PORT}/start-recording`, { method: "POST" })
      .then((response) => response.json())
      .then(() => {
        setIsRecording(true);
        console.log("Recording has started successfully.");
      })
      .catch((error) => console.error("Error starting recording:", error));
  };

  const stopRecording = () => {
    setIsRecording(false);
    readOutput("Recording stopped, processing your request.");
    console.log("Stop recording initiated.");
    fetch(`http://localhost:${PORT}/stop-recording`, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from stop-recording:", data);
        setIsRecording(false);
        const result = data.result || "";
        const commandType = data.command || "unknown";

        
        console.log("Processed Command Type:", commandType);
        console.log("Processed Result:", result);

        // Handle different command types dynamically
        handleCommand(commandType, result, data);
      })
      .catch((error) => console.error("Error stopping recording:", error));
  };

  const handleCommand = (commandType, result, data) => {
    console.log("Handling Command:", commandType);
    switch (commandType) {
      case "analyze_screen":
        const analysis = data?.data?.answer || "Analysis failed.";
        console.log("Screen Analysis Result:", analysis);
        setOutput(analysis);
        readOutput(`Screen analyzed successfully: ${analysis}`);
        break;
      case "search":
        console.log("Search Command Result:", result);
        setOutput(result);
        readOutput(`Search command detected: ${result}`);
        break;
      case "scroll_up":
        console.log("Scroll Up Command.");
        setOutput("Scrolled up. Can I assist with anything else?");
        readOutput("Scrolled up. Can I assist with anything else?");
        break;
      case "scroll_down":
        console.log("Scroll Down Command.");
        setOutput("Scrolled down. Can I assist with anything else?");
        readOutput("Scrolled down. Can I assist with anything else?");
        break;
      case "unknown":
        console.log("Unknown Command.");
        setOutput("Command not recognized. Can I assist with anything else?");
        readOutput("Command not recognized. Can I assist with anything else?");
        break;
      default:
        console.log("Default Command Handler.");
        setOutput(result);
        readOutput(`${result}. Can I assist with anything else?`);
        break;
    }
  };

  const readOutput = (text) => {
    console.log("Text to be spoken:", text);
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.pitch = 1.5;
    speech.rate = 1.1;

    window.speechSynthesis.speak(speech);
  };

  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    console.log("Recording State Changed:", isRecording ? "Recording..." : "Not Recording...");
  }, [isRecording]);

  return (
    <div>
      <button onClick={handleRecording}>
        <img
          src="/images/micIcon.png"
          alt="Record"
          className={`bg-slate-800 w-24 h-24 rounded-full border-2 border-white hover:brightness-150 hover:ring ${
            isRecording ? "animate-pulse brightness-150 ring" : ""
          }`}
        />
      </button>
      {output && (
        <div>
          <h2>Output:</h2>
          <p>{output}</p>
        </div>
      )}
      {isRecording && <p>Recording...</p>}
      {!isRecording && <p>Not Recording...</p>}
    </div>
  );
};

export default MicrophoneInput;