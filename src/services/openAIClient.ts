// File: src/services/openAIClient.ts

import OpenAI from "openai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.development" }); 
// or just `.env` if you prefer; adjust as you like

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});