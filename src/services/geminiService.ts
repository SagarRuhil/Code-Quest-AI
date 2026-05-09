import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const MODELS = {
  FLASH: "gemini-3-flash-preview",
  PRO: "gemini-3.1-pro-preview",
};

export async function chatWithTutor(messages: { role: "user" | "assistant", content: string }[], userContext?: any) {
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" as const : "user" as const,
    parts: [{ text: m.content }]
  }));

  const systemInstruction = `You are Code Quest AI Bot, an expert and patient programming tutor. 
Your goal is to help students embark on a coding journey and master technical skills.
- Use analogies and clear, concise language.
- When they ask for code, provide well-commented, high-quality examples.
- Include "Quest Hints" which are extra tips or fun facts about the topic.
- Be encouraging and supportive, using a modern and professional tone.
- Current User Stats: Level ${userContext?.currentLevel || 1}, Interests: ${userContext?.programmingInterests?.join(", ") || "General Programming"}.
- Use Markdown for code blocks and formatting.`;

  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return response.text;
}

export async function generateQuiz(topic: string, difficulty: string) {
  const prompt = `Generate a programming quiz about "${topic}" with difficulty level "${difficulty}".
The response must be in JSON format and include exactly 5 multiple choice questions.
Each question should have:
- question: The question text
- options: An array of 4 strings
- correctAnswerIndex: The index (0-3) of the correct answer
- explanation: A brief explanation of why the answer is correct`;

  const response = await ai.models.generateContent({
    model: MODELS.PRO,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction: "You are a quiz generator. Return only valid JSON.",
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function checkAnswer(question: string, answer: string, context: string) {
  const prompt = `Question: ${question}
User Answer: ${answer}
Check if this is correct and provide feedback. If incorrect, explain why and guide them.`;

  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: prompt,
    config: {
      systemInstruction: "You are a programming tutor giving feedback on a quiz answer.",
    }
  });

  return response.text;
}
