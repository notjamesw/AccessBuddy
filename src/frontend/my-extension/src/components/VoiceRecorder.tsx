import { useRef, useEffect } from "react";
import "../input.css";

interface VoiceRecorderProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onVoiceInput: (blob: Blob) => void;
}

const VoiceRecorder = ({
  isListening,
  onStart,
  onStop,
  onVoiceInput,
}: VoiceRecorderProps) => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (isListening) {
      startRecording();
    } else if (
      mediaRecorder.current &&
      mediaRecorder.current.state === "recording"
    ) {
      stopRecording();
    }
  }, [isListening]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        onVoiceInput(audioBlob);

        // Clean up the stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.current.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          isListening
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
        onClick={() => {
          if (isListening) {
            onStop();
          } else {
            onStart();
          }
        }}
      >
        <svg
          className="w-8 h-8 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {isListening ? (
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          ) : (
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          )}
        </svg>
      </button>

      <div className="text-sm text-gray-600">
        {isListening ? "Listening..." : "Click to start"}
      </div>
    </div>
  );
};

export default VoiceRecorder;
