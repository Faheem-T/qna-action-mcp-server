import type { KBChunk } from "../entities/KBChunk";

export interface DocumentRepository {
  saveChunks(chunks: KBChunk[], source: string): Promise<void>;
  findSimilarChunks(embedding: number[], k?: number): Promise<KBChunk[]>;
}
