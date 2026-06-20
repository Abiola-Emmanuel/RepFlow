import { createGroq } from "@ai-sdk/groq";

export const COACH_MODEL = "llama-3.3-70b-versatile";

export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "your_key_from_console.groq.com") {
    throw new Error("GROQ_API_KEY is not configured. Add your key from console.groq.com to .env");
  }

  return createGroq({ apiKey });
}

export function getCoachModel() {
  return getGroqClient()(COACH_MODEL);
}
