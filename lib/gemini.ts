// import { GoogleGenerativeAI } from "@google/generative-ai";

// export function geminiModel() {
//   const key = process.env.GEMINI_API_KEY;
//   if (!key) throw new Error("Missing GEMINI_API_KEY");
//   const genAI = new GoogleGenerativeAI(key);
//   return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// }
// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

function getKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");
  return key;
}

export function geminiJsonModel() {
  const genAI = new GoogleGenerativeAI(getKey());
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json", // ✅ JSON mode
      temperature: 0.2,
    },
  });
}
