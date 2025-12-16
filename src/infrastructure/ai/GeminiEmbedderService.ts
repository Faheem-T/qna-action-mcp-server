import { GoogleGenAI } from "@google/genai";
import type { EmbedderService } from "../../domain/services/EmbedderService";

export class GeminiEmbedderService implements EmbedderService {
  private ai: GoogleGenAI;
  private model: string = "gemini-embedding-001";

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.ai.models.embedContent({
      model: this.model,
      contents: [text],
      config: {
        taskType: "SEMANTIC_SIMILARITY",
      },
    });

    const values = response.embeddings?.[0]?.values;
    if (!values) {
      throw new Error("Failed to generate embedding");
    }
    return values;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await this.ai.models.embedContent({
      model: this.model,
      contents: texts,
      config: {
        taskType: "SEMANTIC_SIMILARITY",
      },
    });

    return (
      response.embeddings
        ?.map((e) => e.values)
        .filter((e): e is number[] => e !== undefined) ?? []
    );
  }
}
