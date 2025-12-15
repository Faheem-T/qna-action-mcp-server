import { describe, it, expect, mock, beforeAll, afterAll } from "bun:test";
import { embedChunks } from "./embedChunks";
import type { KBChunk } from "../types/KBChunk";

// Mock the @google/genai module
const mockEmbedContent = mock(() => {
  return Promise.resolve({
    embeddings: [
      { values: [0.1, 0.2, 0.3] },
      { values: [0.4, 0.5, 0.6] },
    ],
  });
});

mock.module("@google/genai", () => {
  return {
    GoogleGenAI: class {
        constructor() {}
      get models() {
        return {
          embedContent: mockEmbedContent,
        };
      }
    },
  };
});

describe("embedChunks", () => {
  it("should call GoogleGenAI and return embeddings", async () => {
    const chunks: KBChunk[] = [
      { id: "1", text: "chunk 1", tokenCount: 10, path: [], sourceId: "A" },
      { id: "2", text: "chunk 2", tokenCount: 20, path: [], sourceId: "B" },
    ];

    const embeddings = await embedChunks(chunks);

    expect(mockEmbedContent).toHaveBeenCalled();
    expect(mockEmbedContent).toHaveBeenCalledWith({
      model: "gemini-embedding-001",
      contents: ["chunk 1", "chunk 2"],
      config: {
        taskType: "SEMANTIC_SIMILARITY",
      },
    });

    expect(embeddings).toBeDefined();
    expect(embeddings).toHaveLength(2);
    expect(embeddings![0]).toEqual([0.1, 0.2, 0.3]);
    expect(embeddings![1]).toEqual([0.4, 0.5, 0.6]);
  });
});
