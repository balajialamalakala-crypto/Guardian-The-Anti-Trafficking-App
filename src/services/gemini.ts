import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getSafetyAdvice = async (context: string) => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide immediate safety advice for someone in a potential human trafficking situation. Context: ${context}. Keep it concise, actionable, and prioritize safety.`,
      config: {
        systemInstruction: "You are a crisis intervention specialist for victims of human trafficking. Your advice must be safe, discreet, and prioritize the user's immediate physical safety.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Please seek immediate help from a local hotline or authority.";
  }
};

export const analyzeReport = async (description: string) => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this suspicious activity report for human trafficking indicators: "${description}". Extract key details like location, behavior, and potential risk level.`,
      config: {
        systemInstruction: "You are an intelligence analyst for an anti-trafficking organization. Your goal is to extract structured data from narrative reports to help authorities prioritize cases.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
