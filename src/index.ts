import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfigs } from "./config-schemas";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import { searchUseCase } from "./di";

const config = await loadConfigs(import.meta.dir + "/configs");

const outputIntentSchema = z.record(
  z.string(),
  z.object({
    description: z.string(),
    allowed_tools: z.array(z.string()).nonempty(),
  }),
);

const intents = outputIntentSchema.parse(config.intents);

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
    outputSchema: { text: z.string() },
    description: "Search knowledge base for relevant documents",
  },
  async ({ query, k }): Promise<CallToolResult> => {
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

server.registerResource(
  "intents",
  "file:///intents.json",
  {
    description: "A resource to classify the intent of the users query",
    mimeType: "application/json",
  },
  async (): Promise<ReadResourceResult> => {
    return {
      contents: [
        {
          uri: "file:///intents.json",
          text: JSON.stringify(intents),
          mimeType: "application/json",
        },
      ],
    };
  },
);

server.registerResource(
  "persona",
  "file:///persona.json",
  { description: "A resource that defines the persona of the LLM model" },
  async (): Promise<ReadResourceResult> => {
    return {
      contents: [
        {
          uri: "file:///persona.json",
          text: JSON.stringify(config.persona),
        },
      ],
    };
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
