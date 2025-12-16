import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { knowledgeBaseDir, server } from "./presentation/mcp/server";
import { vectorizeKnowledgeBaseUseCase } from "./di";

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Clean Architecture QnA Server running on stdio");
  await vectorizeKnowledgeBaseUseCase.exec(knowledgeBaseDir);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
