import z from "zod";
import { loadConfigs } from "../../config-schemas";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import { fs, searchUseCase } from "../../di";

const CONFIG_FOLDER = import.meta.dir + "/../../configs";

const config = await loadConfigs(CONFIG_FOLDER);

const outputIntentSchema = z.record(
  z.string(),
  z.object({
    description: z.string(),
    allowed_tools: z.array(z.string()).nonempty(),
  }),
);

const intents = outputIntentSchema.parse(config.intents);

export const knowledgeBaseDir =
  CONFIG_FOLDER + "/" + config.knowledge_base.knowledge_base.documents_path;

const knowledgeBaseFiles = await fs.getAllDirectoryFileNames(knowledgeBaseDir);

async function readKBFile(filename: string) {
  const fileContent = await Bun.file(knowledgeBaseDir + "/" + filename).text();
  return fileContent;
}

export const server = new McpServer({
  name: "clean_qna_server",
  version: "1.0.0",
});

// search kb tool
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

// intents resource
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

// persona resource
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

// knowledge base document retrieval resource
server.registerResource(
  "knowledge",
  new ResourceTemplate("file://{filename}", {
    list: undefined,
    complete: {
      filename: (value) => {
        return knowledgeBaseFiles.filter((filename) =>
          filename.startsWith(value),
        );
      },
    },
  }),
  { description: "Retrieve documents from the knowledge base" },
  async (uri, { filename }): Promise<ReadResourceResult> => {
    if (!filename) {
      return { contents: [{ text: "Filename is required", uri: uri.href }] };
    }
    if (typeof filename !== "string") {
      return { contents: [{ text: "Invalid filename", uri: uri.href }] };
    }
    if (!knowledgeBaseFiles.includes(filename)) {
      return { contents: [{ text: "File not found", uri: uri.href }] };
    }

    const fileText = await readKBFile(filename);

    return {
      contents: [{ uri: uri.href, text: fileText }],
    };
  },
);
