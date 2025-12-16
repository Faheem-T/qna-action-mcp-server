import type { EmbedderService } from "../../domain/services/EmbedderService";
import type { DocumentRepository } from "../../domain/repositories/DocumentRepository";
import type { KBChunk } from "../../domain/entities/KBChunk";

export class SearchKnowledgeBaseUseCase {
  constructor(
    private embedder: EmbedderService,
    private repository: DocumentRepository
  ) {}

  async execute(query: string, k: number = 5): Promise<KBChunk[]> {
    // 1. Embed query
    const embedding = await this.embedder.embed(query);

    // 2. Search
    const results = await this.repository.findSimilarChunks(embedding, k);

    return results;
  }
}
