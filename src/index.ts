// File: src/index.ts

import express, { Request, Response } from "express";
import axios from "axios";
import cors from "cors"; // Import the CORS middleware
import { analyzeImageBuffer, findFromImage, getImage } from "./services/cain";

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all origins

function formatResponse(isSuccess: boolean, result: any, command: string | null = null) {
  return {
    isSuccess,
    result,
    command: command || null,
  };
}

// 1) Open a new tab
app.post("/open-tab", async (req: Request, res: Response) => {
  const { question } = req.body;
  try {
    await axios.post("http://127.0.0.1:3000/open", { question });
    return res.json(formatResponse(true, "Success, opened a new tab.", "open_tab"));
  } catch (error) {
    console.error("Error opening tab:", error);
    return res.json(formatResponse(false, "Failed to open a new tab", "open_tab"));
  }
});

// 2) Write text
app.post("/write-string", async (req: Request, res: Response) => {
  const { question } = req.body;
  try {
    await axios.post(`http://127.0.0.1:3000/write_text?q=${encodeURIComponent(question)}`);
    return res.json(formatResponse(true, "Wrote your text.", "write_string"));
  } catch (error) {
    console.error("Error writing text:", error);
    return res.json(formatResponse(false, "Failed to write text", "write_string"));
  }
});

// 3) Press a key
app.post("/press-key", async (req: Request, res: Response) => {
  const { question } = req.body;
  try {
    await axios.post(`http://127.0.0.1:3000/press_key?q=${encodeURIComponent(question)}`);
    return res.json(formatResponse(true, "Key pressed.", "press_enter"));
  } catch (error) {
    console.error("Error pressing key:", error);
    return res.json(formatResponse(false, "Failed to press key", "press_enter"));
  }
});

// 4) Analyze screen
app.post("/analyze-screen", async (req: Request, res: Response) => {
  try {

    const screenBuffer = await getImage();
    const answer = await analyzeImageBuffer(screenBuffer);

    if (answer === "Image is too large to analyze. Please resize and try again.") {
      return res.json(formatResponse(false, answer, "analyze_screen"));
    }

    return res.json(formatResponse(true, answer, "analyze_screen"));
  } catch (error) {
    console.error("Error analyzing screen:", error);
    return res.json(formatResponse(false, "Failed to analyze screen", "analyze_screen"));
  }
});

// 5) Navigate page (forward/back)
app.post("/navigate-page", async (req: Request, res: Response) => {
  const { question } = req.body;
  try {
    let zed = "backward";
    const qLower = question.toLowerCase();
    if (qLower.includes("forward") || qLower.includes("next") || qLower.includes("redo")) {
      zed = "forward";
    }
    await axios.post("http://127.0.0.1:3000/navigate_page", { zed });
    return res.json(formatResponse(true, "Navigated!", "navigate_page"));
  } catch (error) {
    console.error("Error navigating page:", error);
    return res.json(formatResponse(false, "Failed to navigate", "navigate_page"));
  }
});

// 6) Scroll page
app.post("/scroll-page", async (req: Request, res: Response) => {
  const { question } = req.body;
  try {
    let direction = "down";
    if (question.toLowerCase().includes("up")) {
      direction = "up";
    }
    await axios.post("http://127.0.0.1:3000/scroll", { direction, amount: 50 });

    return res.json(formatResponse(true, "Scrolled the page.", "scroll_page"));
  } catch (error) {
    console.error("Error scrolling page:", error);
    return res.json(formatResponse(false, "Failed to scroll", "scroll_page"));
  }
});

// 7) Click request
app.post("/click-request", async (req: Request, res: Response) => {
  const { question } = req.body;
  try {
    await axios.get("http://127.0.0.1:3000/analyze_screen");
    const screenBuffer = await getImage();
    const targetText = await findFromImage(screenBuffer, question);
    await axios.post(`http://127.0.0.1:3000/click_request?q=${encodeURIComponent(targetText)}`);

    return res.json(formatResponse(true, "Clicked the specified text.", "click_request"));
  } catch (error) {
    console.error("Error in click request:", error);
    return res.json(formatResponse(false, "Failed to click", "click_request"));
  }
});

// Start recording
app.post("/start-recording", async (req: Request, res: Response) => {
  try {
    await axios.post("http://127.0.0.1:3000/start_recording");
    return res.json(formatResponse(true, "Recording has been started successfully.", "start_recording"));
  } catch (error) {
    console.error("Error starting recording:", error);
    return res.status(500).json(formatResponse(false, "Failed to start recording", "start_recording"));
  }
});

// Stop recording and process command
app.post("/stop-recording", async (req: Request, res: Response) => {
  try {
    const response = await axios.post("http://127.0.0.1:3000/stop_recording");
    const { result } = response.data;
    console.log("Response from stop-recording:", result);

    if(result.isSuccess == false) {
      return res.status(500).json(formatResponse(false, "Failed to stop recording", "stop_recording"));
    }

    if (result.command === "analyze_screen") {
      console.log("Analyze screen node");
      return result.json(formatResponse(true, result.result, "analyze_screen"));
    } else if (result.command === "scroll_up") {
      const commandResult = await axios.post("http://127.0.0.1:2022/scroll-page", { question: "scroll up" });
      console.log("Scroll up result:", commandResult);
      return commandResult;
    } else if (result.command === "scroll_down") {
      const commandResult = await axios.post("http://127.0.0.1:2022/scroll-page", { question: "scroll down" });
      console.log("Scroll down result:", commandResult);
      return commandResult;
    } else {
      return result;
    }
  } catch (error) {
    console.error("Error stopping recording or processing command:", error);
    return res.status(500).json(formatResponse(false, "Failed to stop recording", "stop_recording"));
  }
});

// // Stop recording and process command
// app.post("/stop-recording", async (req: Request, res: Response) => {
//   try {
//     const response = await axios.post("http://127.0.0.1:3000/stop_recording");
//     const { result, command } = response.data;

//     return res.json(formatResponse(true, result, command));
//   } catch (error) {
//     console.error("Error stopping recording or processing command:", error);
//     return res.json(formatResponse(false, "Failed to stop recording or process the command", "stop_recording"));
//   }
// });

// Start the Node server
const PORT = 2022;
app.listen(PORT, () => {
  console.log(`Node server running at http://localhost:${PORT}`);
});