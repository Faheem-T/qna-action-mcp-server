import type { DocumentParser } from "../../domain/services/DocumentParser";
import type { DocumentChunker } from "../../domain/services/DocumentChunker";
import type { EmbedderService } from "../../domain/services/EmbedderService";
import type { DocumentRepository } from "../../domain/repositories/DocumentRepository";

export class IngestDocumentUseCase {
  constructor(
    private parser: DocumentParser,
    private chunker: DocumentChunker,
    private embedder: EmbedderService,
    private repository: DocumentRepository,
  ) {}

  async execute(
    content: string,
    sourceId: string,
    fileType: string,
  ): Promise<void> {
    // 1. Parse
    const parsedDoc = await this.parser.parse(content, sourceId, fileType);

    // 2. Chunk
    const chunks = this.chunker.chunk(parsedDoc);

    // 3. Embed
    const texts = chunks.map((c) => c.text);
    const embeddings = await this.embedder.embedBatch(texts);

    // Assign embeddings to chunks
    chunks.forEach((chunk, index) => {
      chunk.embedding = embeddings[index];
    });

    // 4. Store
    await this.repository.saveChunks(chunks, sourceId);
  }
}
