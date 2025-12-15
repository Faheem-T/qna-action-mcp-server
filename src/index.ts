import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfigs } from "./config-schemas";

const configs = await loadConfigs(import.meta.dir + "/configs");

const server = new McpServer({
  name: "qna_and_action_mcp_server",
  version: "1.0.0",
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Configs:", configs);
  console.error("QnA & Action Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

