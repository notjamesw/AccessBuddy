import { useState } from "react";
import "./App.css";
import VoiceRecorder from "./components/VoiceRecorder";

const App: React.FC = () => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [processingState, setProcessingState] = useState<
    "idle" | "recording" | "processing" | "speaking"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleVoiceInput = async (_audioBlob: Blob) => {
    setProcessingState("processing");
    setError(null);

    try {
      setProcessingState("speaking");
    } catch (error) {
      console.error("Error processing voice command:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setProcessingState("idle");
    }
  };

  return (
    <div className="w-[300px] h-[400px] p-2 flex flex-col">
      <div className="text-left mb-4">
        <h1 className="text-xl font-bold text-gray-800">AccessBuddy.ai</h1>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        <VoiceRecorder
          isListening={isListening}
          onStart={() => setIsListening(true)}
          onStop={() => setIsListening(false)}
          onVoiceInput={handleVoiceInput}
        />

        {error && <div className="text-red-500 mt-4 text-sm">{error}</div>}

        <div className="mt-2 text-sm text-gray-600">
          Status: {processingState}
        </div>
      </div>
    </div>
  );
};

export default App;
