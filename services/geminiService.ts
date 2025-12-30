
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client using the environment variable as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStudyTips = async (topic: string, subject: string, grade: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3 short, high-impact study tips for a Class ${grade} student learning the topic "${topic}" in ${subject}. Focus on active recall and visualization. Keep it concise.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Keep studying hard! Use active recall and spaced repetition for better results.";
  }
};

export const generateMCQs = async (topic: string, subject: string, grade: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 multiple-choice questions for Class ${grade} ${subject} on the topic "${topic}". 
      Return the output as a JSON array of objects with keys: "question", "options" (array of 4 strings), and "answer" (0-3 index of the correct option).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.INTEGER }
            },
            required: ["question", "options", "answer"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("MCQ Generation Error:", error);
    return null;
  }
};
