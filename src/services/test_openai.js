import { readFileSync } from "fs";
import { openai } from "./openAIClient";

async function testAnalyzeImage() {
    try {
        const imagePath = "./temp/image.png"; // Adjust if needed
        const imageBuffer = readFileSync(imagePath);
        const base64Image = imageBuffer.toString("base64");
        const dataUrl = `data:image/png;base64,${base64Image}`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: `What do you see in this image? Summarize clearly.`,
                },
                {
                    role: "user",
                    name: "image",
                    content: dataUrl,
                },
            ],
            max_tokens: 1024,
        });

        console.log("OpenAI Response:", response.data);
    } catch (error) {
        console.error("Error testing OpenAI:", error.response?.data || error.message);
    }
}

testAnalyzeImage();