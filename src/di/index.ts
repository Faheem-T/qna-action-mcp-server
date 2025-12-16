import { drizzle } from "drizzle-orm/node-postgres";
import { IngestDocumentUsecase } from "../application/use-cases/IngestDocumentUsecase";
import { SearchKnowledgeBaseUseCase } from "../application/use-cases/SearchKnowledgeBaseUseCase";
import { VectorizeKnowledgeBaseUsecase } from "../application/use-cases/VectorizeKnowledgeBaseUsecase";
import { GeminiEmbedderService } from "../infrastructure/ai/GeminiEmbedderService";
import { SlidingWindowChunker } from "../infrastructure/chunkers/SlidingWindowChunker";
import { DrizzleDocumentRepository } from "../infrastructure/db/DrizzleDocumentRepository";
import { FileSystemService } from "../infrastructure/fs/FileSystemService";
import { RemarkMarkdownParser } from "../infrastructure/parsers/MarkdownParser";
import { ParserFactory } from "../infrastructure/parsers/ParserFactory";
import { TextParser } from "../infrastructure/parsers/TextParser";
import { CreateTicketUsecase } from "../application/use-cases/CreateTicketUsecase";
import { TicketingService } from "../infrastructure/ticketing/TicketingService";
import { config } from "../utils/loadConfig";
import { TicketSchemaValidator } from "../infrastructure/ticketing/TicketSchemaValidator";
import { ticketSchema } from "../utils/loadTicketSchema";

// Initialize DB
const db = drizzle(
  process.env.DATABASE_URL || "postgres://postgres:password@localhost:5432",
);
await db.execute("select 'Hello there'");
console.error("Connected to DB successfully");

// Initialize Infrastructure
const embedder = new GeminiEmbedderService();
const repository = new DrizzleDocumentRepository(db);
const markdownParser = new RemarkMarkdownParser();
const textParser = new TextParser();
const chunker = new SlidingWindowChunker();
export const fs = new FileSystemService();
const ticketSchemaValidator = new TicketSchemaValidator(ticketSchema);
const ticketingService = new TicketingService(
  config.ticketing.endpoint,
  config.ticketing.method,
  ticketSchemaValidator,
);

// Initialize factory
const parserFactory = new ParserFactory([markdownParser, textParser]);

// Initialize Use Cases
export const ingestUseCase = new IngestDocumentUsecase(
  parserFactory,
  chunker,
  embedder,
  repository,
);

export const vectorizeKnowledgeBaseUseCase = new VectorizeKnowledgeBaseUsecase(
  fs,
  ingestUseCase,
);

export const searchUseCase = new SearchKnowledgeBaseUseCase(
  embedder,
  repository,
);

export const createTicketUsecase = new CreateTicketUsecase(ticketingService);
