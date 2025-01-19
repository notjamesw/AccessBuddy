import OpenAI from "openai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.development" }); 
// just `.env` works as well, can adjust this

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});