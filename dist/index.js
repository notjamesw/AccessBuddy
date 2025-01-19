"use strict";
// File: src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors")); // Import the CORS middleware
const cain_1 = require("./services/cain");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)()); // Enable CORS for all origins
// 1) Open a new tab
app.post("/open-tab", async (req, res) => {
    const { question } = req.body;
    try {
        await axios_1.default.post("http://127.0.0.1:3000/open", { question });
        return res.json({
            text: "Success, opened a new tab.",
            data: { answer: "Success, opened a new tab." },
        });
    }
    catch (error) {
        console.error("Error opening tab:", error);
        return res.json({
            text: "Failed to open a new tab",
            data: { answer: "Please check if the Python server is running." },
        });
    }
});
// 2) Write text
app.post("/write-string", async (req, res) => {
    const { question } = req.body;
    try {
        await axios_1.default.post(`http://127.0.0.1:3000/write_text?q=${encodeURIComponent(question)}`);
        return res.json({
            text: "Success, typed the text.",
            data: { answer: "Wrote your text." },
        });
    }
    catch (error) {
        console.error("Error writing text:", error);
        return res.json({
            text: "Failed to write text",
            data: { answer: "Python server might not be running." },
        });
    }
});
// 3) Press a key
app.post("/press-key", async (req, res) => {
    const { question } = req.body;
    try {
        await axios_1.default.post(`http://127.0.0.1:3000/press_key?q=${encodeURIComponent(question)}`);
        return res.json({ text: "Key pressed.", data: { answer: "Success." } });
    }
    catch (error) {
        console.error("Error pressing key:", error);
        return res.json({
            text: "Failed to press key",
            data: { answer: "Python server might not be running." },
        });
    }
});
// 4) Analyze screen
app.post("/analyze-screen", async (req, res) => {
    try {
        await axios_1.default.get("http://127.0.0.1:3000/analyze_screen");
        const screenBuffer = await (0, cain_1.getImage)();
        const answer = await (0, cain_1.analyzeImageBuffer)(screenBuffer);
        if (answer === "Image is too large to analyze. Please resize and try again.") {
            return res.status(400).json({
                text: "Failed to analyze screen",
                data: { answer },
            });
        }
        return res.json({
            text: "Screen analysis complete",
            data: { answer },
        });
    }
    catch (error) {
        console.error("Error analyzing screen:", error);
        return res.status(500).json({
            text: "Failed to analyze screen",
            data: { answer: "Check Python server or OpenAI config." },
        });
    }
});
// 5) Navigate page (forward/back)
app.post("/navigate-page", async (req, res) => {
    const { question } = req.body;
    try {
        let zed = "backward";
        const qLower = question.toLowerCase();
        if (qLower.includes("forward") || qLower.includes("next") || qLower.includes("redo")) {
            zed = "forward";
        }
        await axios_1.default.post("http://127.0.0.1:3000/navigate_page", { zed });
        return res.json({ text: "Navigated!", data: { answer: "Done" } });
    }
    catch (error) {
        console.error("Error navigating page:", error);
        return res.json({
            text: "Failed to navigate",
            data: { answer: "Python server might not be running." },
        });
    }
});
// 6) Scroll page
app.post("/scroll-page", async (req, res) => {
    const { question } = req.body;
    try {
        let direction = "down";
        if (question.toLowerCase().includes("up")) {
            direction = "up";
        }
        await axios_1.default.post("http://127.0.0.1:3000/scroll", { direction, amount: 50 });
        return res.json({
            text: "Scrolled the page.",
            data: { answer: "Success" },
        });
    }
    catch (error) {
        console.error("Error scrolling page:", error);
        return res.json({
            text: "Failed to scroll",
            data: { answer: "Python server might not be running." },
        });
    }
});
// 7) Click request
app.post("/click-request", async (req, res) => {
    const { question } = req.body;
    try {
        // first take a fresh screenshot
        await axios_1.default.get("http://127.0.0.1:3000/analyze_screen");
        const screenBuffer = await (0, cain_1.getImage)();
        // figure out what the user wants to click
        const targetText = await (0, cain_1.findFromImage)(screenBuffer, question);
        // ask python to actually click it
        await axios_1.default.post(`http://127.0.0.1:3000/click_request?q=${encodeURIComponent(targetText)}`);
        return res.json({
            text: "Click request complete",
            data: { answer: "Clicked the specified text." },
        });
    }
    catch (error) {
        console.error("Error in click request:", error);
        return res.json({
            text: "Failed to click",
            data: { answer: "Could not analyze or click the requested text." },
        });
    }
});
// Start recording
app.post("/start-recording", async (req, res) => {
    try {
        await axios_1.default.post("http://127.0.0.1:3000/start_recording");
        return res.json({
            text: "Recording started.",
            data: { answer: "Recording has been started successfully." },
        });
    }
    catch (error) {
        console.error("Error starting recording:", error);
        return res.status(500).json({
            text: "Failed to start recording",
            data: { answer: "Ensure the Python backend is running." },
        });
    }
});
// Stop recording and process command
app.post("/stop-recording", async (req, res) => {
    try {
        const response = await axios_1.default.post("http://127.0.0.1:3000/stop_recording");
        const { result } = response.data;
        if (result === "analyze_screen") {
            await axios_1.default.post("http://127.0.0.1:2022/analyze-screen", {});
            return res.json({
                text: "Screen analysis initiated.",
                data: { answer: "Screen analyzed successfully." },
            });
        }
        else if (result === "scroll_up") {
            await axios_1.default.post("http://127.0.0.1:2022/scroll-page", { question: "scroll up" });
            return res.json({
                text: "Scrolled up successfully.",
                data: { answer: "Page scrolled up." },
            });
        }
        else if (result === "scroll_down") {
            await axios_1.default.post("http://127.0.0.1:2022/scroll-page", { question: "scroll down" });
            return res.json({
                text: "Scrolled down successfully.",
                data: { answer: "Page scrolled down." },
            });
        }
        return res.json({
            text: "Command processed.",
            data: { answer: result },
        });
    }
    catch (error) {
        console.error("Error stopping recording or processing command:", error);
        return res.status(500).json({
            text: "Failed to stop recording or process the command",
            data: { answer: "Ensure the Python backend is running and configured properly." },
        });
    }
});
// Start the Node server
const PORT = 2022;
app.listen(PORT, () => {
    console.log(`Node server running at http://localhost:${PORT}`);
});
