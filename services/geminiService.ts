
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestGoals = async (theme: string, lang: Language) => {
  const languageName = lang === 'ja' ? '日本語' : 'English';
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 25 personal goals for the user's "Life Bingo" based on the theme: "${theme}".
                 Return the results in ${languageName}.
                 Each goal should be concise (max 15 characters or 5 words) and assigned a difficulty (1:Easy to 5:Hard).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The goal text" },
              difficulty: { type: Type.INTEGER, description: "Difficulty level (1-5)" }
            },
            required: ["text", "difficulty"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini goal suggestion failed:", error);
    return [];
  }
};
