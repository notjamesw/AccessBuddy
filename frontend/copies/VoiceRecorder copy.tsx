import React, { useEffect, useState } from "react";

const PORT = 2022;

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [output, setOutPut] = useState("");

  const startRecording = () => {
    setIsRecording(true);
    readOutput("recording started");

  }

  const readOutput = (message: string) = {

  }

  return (
    <div>
      <button onClick={handleRecording}></button>
    </div>
  )
};

export default VoiceRecorder;