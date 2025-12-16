import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./presentation/mcp/server";

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
