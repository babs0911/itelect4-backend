import { GoogleGenAI, Type, type Content } from "@google/genai";

import { aiReplySchema, type AiReply } from "../schemas/ai.js";
import { EXAMPLES, MODEL, SYSTEM_PROMPT, wrap } from "./prompt.js";

export class AiReplyError extends Error {}

function buildContents(prompt: string): Content[] {
  const examples: Content[] = EXAMPLES.flatMap((example) => [
    { role: "user", parts: [{ text: wrap(example.prompt) }] },
    { role: "model", parts: [{ text: JSON.stringify(example.reply) }] },
  ]);

  return [...examples, { role: "user", parts: [{ text: wrap(prompt) }] }];
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

export async function askLibraryAssistant(prompt: string): Promise<AiReply> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(prompt),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: [
              "book-recommendation",
              "reservation-help",
              "account-help",
              "general-library-help",
            ],
          },
          answer: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["category", "answer", "suggestions", "nextSteps"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new AiReplyError("The AI returned an empty response");
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new AiReplyError("The AI response was not valid JSON");
  }

  const result = aiReplySchema.safeParse(data);
  if (!result.success) {
    throw new AiReplyError("The AI response did not match the expected format");
  }

  return result.data;
}
