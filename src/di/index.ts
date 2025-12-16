import { IngestDocumentUseCase } from "../application/use-cases/IngestDocumentUseCase";
import { SearchKnowledgeBaseUseCase } from "../application/use-cases/SearchKnowledgeBaseUseCase";
import { GeminiEmbedderService } from "../infrastructure/ai/GeminiEmbedderService";
import { SlidingWindowChunker } from "../infrastructure/chunkers/SlidingWindowChunker";
import { DrizzleDocumentRepository } from "../infrastructure/db/DrizzleDocumentRepository";
import { FileSystemService } from "../infrastructure/fs/FileSystemService";
import { RemarkMarkdownParser } from "../infrastructure/parsers/RemarkMarkdownParser";

// Initialize Infrastructure
const embedder = new GeminiEmbedderService();
const repository = new DrizzleDocumentRepository();
const parser = new RemarkMarkdownParser();
const chunker = new SlidingWindowChunker();
export const fs = new FileSystemService();

// Initialize Use Cases
export const ingestUseCase = new IngestDocumentUseCase(
  parser,
  chunker,
  embedder,
  repository,
);
export const searchUseCase = new SearchKnowledgeBaseUseCase(
  embedder,
  repository,
);
