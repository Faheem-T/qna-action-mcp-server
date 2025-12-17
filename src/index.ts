import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./presentation/mcp/server";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";

async function main() {
  const app = createMcpExpressApp({ host: "localhost" });
  // POST endpoint
  app.post("/mcp", async (req: any, res: any) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Disable sessions
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // GET endpoint for SSE notifications (if needed)
  app.get("/mcp", async (req: any, res: any) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res);
  });

  app.listen(3000, () => {
    console.log("Stateless MCP Server running on http://localhost:3000/mcp");
  });
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
