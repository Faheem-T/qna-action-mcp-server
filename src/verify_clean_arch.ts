import { GeminiEmbedderService } from "./infrastructure/ai/GeminiEmbedderService";
import { DrizzleDocumentRepository } from "./infrastructure/db/DrizzleDocumentRepository";
import { RemarkMarkdownParser } from "./infrastructure/parsers/RemarkMarkdownParser";
import { SlidingWindowChunker } from "./infrastructure/chunkers/SlidingWindowChunker";

import { IngestDocumentUseCase } from "./application/use-cases/IngestDocumentUseCase";
import { SearchKnowledgeBaseUseCase } from "./application/use-cases/SearchKnowledgeBaseUseCase";

async function verify() {
  console.log("Initializing Clean Architecture components...");

  // Mocking/Stubbing could be done here, but we will use real infra if env vars check out
  // Ensure DATABASE_URL and GEMINI_API_KEY are set if running this.
  console.log("Environment Check:");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not Set");
  console.log(
    "GEMINI_API_KEY:",
    process.env.GEMINI_API_KEY ? "Set" : "Not Set",
  );

  const embedder = new GeminiEmbedderService();
  const repository = new DrizzleDocumentRepository();
  const parser = new RemarkMarkdownParser();
  const chunker = new SlidingWindowChunker();

  const ingestUseCase = new IngestDocumentUseCase(
    parser,
    chunker,
    embedder,
    repository,
  );
  const searchUseCase = new SearchKnowledgeBaseUseCase(embedder, repository);

  const testDoc = `
# Clean Architecture verification

This is a test document to verify the clean architecture refactor.

## Section 1
It should be parsed into chunks and embedded.
  `;
  const sourceId = "verify_clean_arch_test";

  console.log("Step 1: Ingesting document...");
  try {
    await ingestUseCase.execute(testDoc, sourceId, "md");
    console.log("Ingestion successful.");
  } catch (err) {
    console.error("Ingestion failed:", err);
    return;
  }

  console.log("Step 2: Searching knowledge base...");
  try {
    const results = await searchUseCase.execute(
      "clean architecture verification",
      3,
    );
    console.log("Search results:", results.length);
    results.forEach((r, i) => {
      console.log(`[${i}] ${r.text.substring(0, 50)}...`);
    });
  } catch (err) {
    console.error("Search failed:", err);
  }
}

if (import.meta.main) {
  verify();
}
