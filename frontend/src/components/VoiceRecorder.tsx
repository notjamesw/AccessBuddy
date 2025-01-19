import React, { useEffect, useState } from "react";

const PORT = 2022;

const MicrophoneInput = () => {
  const [output, setOutput] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    readOutput("Recording started, please speak now.");
    fetch(`http://localhost:${PORT}/start-recording`, { method: "POST" })
      .then((response) => response.json())
      .then(() => setIsRecording(true))
      .catch((error) => console.error("Error starting recording:", error));
  };

  const stopRecording = () => {
    setIsRecording(false);
    readOutput("Recording stopped, processing your request.");
    fetch(`http://localhost:${PORT}/stop-recording`, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        setIsRecording(false);
        setOutput(data.result); // Assuming backend returns `{ result: "Processed Text" }`
        readOutput(data.result);
      })
      .catch((error) => console.error("Error stopping recording:", error));
  };

  const readOutput = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    
    speech.lang = 'en-US';
    speech.pitch = 1.5;
    speech.rate = 1.1;

    // Speak the text
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
        if(isRecording) {
            console.log("Recording...");
        } else {
            console.log("Not Recording...");
        }
    }, [isRecording]);


  return (
    <div>
      <button onClick={handleRecording}>
        <img
          src="/images/micIcon.png"
          alt="Record"
          className={`bg-slate-800 w-24 h-24 rounded-full border-2 border-white hover:brightness-150 hover:ring ${isRecording ? 'animate-pulse brightness-150 ring' : '' }`}
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