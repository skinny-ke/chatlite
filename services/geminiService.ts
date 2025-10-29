import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
// Fix: Corrected import path for types. The error was due to types.ts being empty.
import type { GroundingMetadata } from "../types";

const model = 'gemini-2.5-flash';

// Fix: Refactored to align with Gemini API guidelines.
// This includes initializing the client within the function, using process.env.API_KEY directly,
// and simplifying the 'contents' payload for text prompts.
export const getGeminiResponse = async (prompt: string): Promise<{ text: string; groundingMetadata?: GroundingMetadata }> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API key not found. AI features will be disabled.");
    return { text: "Sorry, the AI service is currently unavailable." };
  }

  // Fix: Per Gemini guidelines, create a new GoogleGenAI instance for each request to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      // Fix: The prompt is correctly passed as the 'contents'.
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Fix: Directly access the 'text' property from the response object as per guidelines.
    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
    
    return { text, groundingMetadata };

  } catch (error) {
    console.error("Error getting response from Gemini:", error);
    return { text: "Sorry, I encountered an error. Please try again." };
  }
};
