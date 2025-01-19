import record from "node-record-lpcm16";
import { Writable } from "stream";

let recording: any;
let audioData: Buffer[] = [];

/**
 * Start recording audio from the microphone.
 */
export function startRecording(): void {
  audioData = [];
  recording = record
    .record({
      sampleRate: 44100,
      verbose: true,
    })
    .stream()
    .pipe(
      new Writable({
        write(chunk, encoding, callback) {
          audioData.push(chunk);
          callback();
        },
      })
    );
  console.log("Recording started");
}

/**
 * Stop recording audio and save it to a file.
 */
export async function stopRecording(): Promise<void> {
  return new Promise((resolve, reject) => {
    recording.stop();
    const filePath = path.resolve(__dirname, "../temp/output.wav");
    fsPromises
      .writeFile(filePath, Buffer.concat(audioData))
      .then(() => {
        console.log("Recording stopped and saved");
        resolve();
      })
      .catch((err) => {
        console.error("Error saving audio file:", err);
        reject(err);
      });
  });
}