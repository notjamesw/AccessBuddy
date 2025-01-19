"use strict";
// File: src/services/cain.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImage = getImage;
exports.analyzeImageBuffer = analyzeImageBuffer;
exports.findFromImage = findFromImage;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const openAIClient_1 = require("./openAIClient");
/**
 * Read the screenshot from disk.
 */
async function getImage() {
    try {
        const filePath = path_1.default.resolve(__dirname, "/Users/inderjeet/Downloads/SoCalHackathon2024/temp/image.png");
        const data = await fs_1.promises.readFile(filePath);
        console.log(`Image size (bytes): ${data.length}`);
        return data;
    }
    catch (err) {
        console.error("Error reading image file:", err);
        throw err;
    }
}
/**
 * Use OpenAI to describe what's in the image.
 */
async function analyzeImageBuffer(buffer) {
    try {
        const base64Image = buffer.toString("base64");
        const dataUrl = `data:image/png;base64,${base64Image}`;
        const response = await openAIClient_1.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What's in this image?" },
                        {
                            type: "image_url",
                            image_url: { url: dataUrl, detail: "low" },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });
        return response.choices[0]?.message?.content || "No response from model.";
    }
    catch (error) {
        console.error("Error analyzing image:", error);
        return "An error occurred while analyzing the image.";
    }
}
/**
 * Use OpenAI to find the exact word or phrase the user wants to click.
 */
async function findFromImage(buffer, question) {
    try {
        const base64Image = buffer.toString("base64");
        // Log size and handle oversized images
        console.log(`Base64 Image Size: ${base64Image.length} characters`);
        if (base64Image.length > 50000) { // Adjust threshold
            console.warn("Image is too large for API request. Resize or compress further.");
            return "Image is too large to analyze. Please resize and try again.";
        }
        const dataUrl = `data:image/png;base64,${base64Image}`;
        const response = await openAIClient_1.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: `
                      The user wants to click on something. 
                      Question: "${question}".
                      Analyze the image, find the best single word or phrase. 
                      Return ONLY that word or phrase.
                  `,
                },
                {
                    role: "user",
                    name: "image",
                    content: dataUrl,
                },
            ],
            max_tokens: 256, // Reduce max tokens
        });
        return response.choices[0]?.message?.content || "No response from model.";
    }
    catch (error) {
        console.error("Error analyzing image for click:", error);
        return "An error occurred while processing the click request.";
    }
}
