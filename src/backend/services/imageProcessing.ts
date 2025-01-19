import { promises as fsPromises } from "fs";
import path from "path";
import { openai } from "./openAIClient";

/**
 * Read the screenshot from disk.
 */
export async function getImage(): Promise<Buffer> {
  const relativeImagePath = "../temp/image.png";
  try {
    const filePath = path.resolve(__dirname, relativeImagePath);

    const data = await fsPromises.readFile(filePath);
    console.log(`Image size (bytes): ${data.length}`);
    return data;
  } catch (err) {
    console.error("Error reading image file:", err);
    throw err;
  }
}

/**
 * Use OpenAI to describe what's in the image.
 */
export async function analyzeImageBuffer(buffer: Buffer): Promise<string> {
  try {
    const base64Image = buffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64Image}`;

    const response = await openai.chat.completions.create({
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
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "An error occurred while analyzing the image.";
  }
}

/**
 * Use OpenAI to find the exact word or phrase the user wants to click.
 */
export async function findFromImage(buffer: Buffer, question: string): Promise<string> {
  try {
      const base64Image = buffer.toString("base64");

      // Log size and handle oversized images
      console.log(`Base64 Image Size: ${base64Image.length} characters`);
      if (base64Image.length > 50000) { // Adjust threshold
          console.warn("Image is too large for API request. Resize or compress further.");
          return "Image is too large to analyze. Please resize and try again.";
      }

      const dataUrl = `data:image/png;base64,${base64Image}`;

      const response = await openai.chat.completions.create({
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
  } catch (error) {
      console.error("Error analyzing image for click:", error);
      return "An error occurred while processing the click request.";
  }
}