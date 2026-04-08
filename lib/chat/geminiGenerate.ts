import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateGeminiChatReply(params: {
  apiKey: string;
  systemInstruction: string;
  userText: string;
  maxOutputTokens: number;
  temperature: number;
  modelId: string;
}): Promise<string> {
  const genAI = new GoogleGenerativeAI(params.apiKey);
  const model = genAI.getGenerativeModel({
    model: params.modelId,
    systemInstruction: params.systemInstruction,
    generationConfig: {
      maxOutputTokens: params.maxOutputTokens,
      temperature: params.temperature,
      // Note: this SDK’s GenerationConfig has no “thinking budget” field; keep
      // maxOutputTokens modest in the route to cap billed output.
    },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: params.userText }] }],
  });

  const text = result.response.text()?.trim() ?? "";
  return text || "I couldn't generate a reply. Please try again in a moment.";
}
