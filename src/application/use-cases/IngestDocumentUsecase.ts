import type { DocumentRepository } from "../../domain/repositories/DocumentRepository";
import type { DocumentChunker } from "../../domain/services/DocumentChunker";
import type { EmbedderService } from "../../domain/services/EmbedderService";
import type { IParserFactory } from "../../domain/services/IParserFactory";

export class IngestDocumentUsecase {
  constructor(
    private readonly _parserFactory: IParserFactory,
    private readonly _chunker: DocumentChunker,
    private readonly _embedder: EmbedderService,
    private readonly _repository: DocumentRepository,
  ) {}

  exec = async (content: string, filename: string, mimeType: string) => {
    // 1. Parse
    const parser = this._parserFactory.getParser(mimeType);
    const parsedDocument = await parser.parse(content, filename, mimeType);

    // 2. Chunk
    const chunks = this._chunker.chunk(parsedDocument);

    // 3. Embed
    const texts = chunks.map((c) => c.text);
    const embeddings = await this._embedder.embedBatch(texts);

    // Assign embeddings to chunks
    chunks.forEach((chunk, index) => {
      chunk.embedding = embeddings[index];
    });

    // 4. Store
    await this._repository.saveChunks(chunks, filename);
  };
}
