import type { KBChunk } from "../types/KBChunk";
import { GoogleGenAI } from "@google/genai";

export async function embedChunks(chunks: KBChunk[]) {
  const ai = new GoogleGenAI({});

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: chunks.map((v) => v.text),
    config: {
      taskType: "SEMANTIC_SIMILARITY",
    },
  });

  const embeddings = response.embeddings
    ?.map((e) => e.values)
    .filter((e) => e !== undefined)!;

  return embeddings;
}

