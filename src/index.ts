import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GeminiEmbedderService } from "./infrastructure/ai/GeminiEmbedderService";
import { DrizzleDocumentRepository } from "./infrastructure/db/DrizzleDocumentRepository";
import { RemarkMarkdownParser } from "./infrastructure/parsers/RemarkMarkdownParser";
import { SlidingWindowChunker } from "./infrastructure/chunkers/SlidingWindowChunker";

import { IngestDocumentUseCase } from "./application/use-cases/IngestDocumentUseCase";
import { SearchKnowledgeBaseUseCase } from "./application/use-cases/SearchKnowledgeBaseUseCase";

// 1. Initialize Infrastructure
const embedder = new GeminiEmbedderService();
const repository = new DrizzleDocumentRepository();
const parser = new RemarkMarkdownParser();
const chunker = new SlidingWindowChunker();

// 2. Initialize Use Cases
const ingestUseCase = new IngestDocumentUseCase(parser, chunker, embedder, repository);
const searchUseCase = new SearchKnowledgeBaseUseCase(embedder, repository);

// 3. Setup MCP Server
const server = new McpServer({
  name: "clean_qna_server",
  version: "1.0.0",
});


server.registerTool(
  "search_knowledge_base",
  {
    inputSchema: {
      query: z.string().describe("The search query"),
      k: z.number().default(5).describe("Number of results to return"),
    },
    outputSchema: {},
  },
  async ({ query, k }) => {
    try {
      const results = await searchUseCase.execute(query, k);
      const textResponse = results
        .map((r: any) => `[Score: ?] ${r.text.substring(0, 200)}...`)
        .join("\n\n---\n\n");

      return {
        content: [{ type: "text", text: textResponse || "No results found." }],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching knowledge base: ${err.message}`,
          },
        ],
        isError: true,
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Clean Architecture QnA Server running on stdio");
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
