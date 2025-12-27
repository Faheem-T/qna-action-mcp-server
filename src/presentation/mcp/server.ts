import z from "zod";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import { createTicketUsecase, fs, searchUseCase } from "../../di";
import { config, CONFIG_FOLDER } from "../../utils/loadConfig";
import { ticketSchema } from "../../utils/loadTicketSchema";
import {
  MCPServerToolNames,
  MCPServerTools,
} from "../../constants/mcpServerToolNames";
import { IntentResource } from "./resources/IntentResource";

export const knowledgeBaseDir =
  CONFIG_FOLDER + "/" + config.knowledge_base.knowledge_base.documents_path;

const knowledgeBaseFiles = await fs.getAllDirectoryFileNames(knowledgeBaseDir);

async function readKBFile(filename: string) {
  const fileContent = await Bun.file(knowledgeBaseDir + "/" + filename).text();
  return fileContent;
}

const INTENT_NAMES = config.intents.map((intent) => intent.name);

export const server = new McpServer({
  name: "clean_qna_server",
  version: "1.0.0",
});

// search kb tool
server.registerTool(
  MCPServerTools.SEARCH_KB_TOOL,
  {
    inputSchema: {
      query: z.string().describe("The search query"),
      k: z.number().default(5).describe("Number of results to return"),
      intent: z.enum(INTENT_NAMES),
    },
    outputSchema: { text: z.string() },
    description: "Search knowledge base for relevant documents",
  },
  async ({ query, intent, k }): Promise<CallToolResult> => {
    console.log(
      `Search kb tool call. Query: ${query}\nIntent: ${intent} \nk: ${k}`,
    );
    try {
      const results = await searchUseCase.execute(query, k);
      const textResponse = results
        .map(
          (chunk) =>
            // `[Score: ?] Document Name: ${chunk.metadata.sourceId} \n ${chunk.text.substring(0, 750)}...`,
            // TODO: Score chunks
            `[Score: ?] Document Name: ${chunk.metadata.sourceId} \n ${chunk.text}`,
        )
        .join("\n\n---\n\n");

      return {
        content: [{ type: "text", text: textResponse || "No results found." }],
        structuredContent: { text: textResponse },
      };
    } catch (err: any) {
      console.log("Error searching knowledge base", err);
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
          text: IntentResource,
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
  new ResourceTemplate("file:///{filename}", {
    list: undefined,
    // NOTE: uncomment to enable listing
    // list: () => {
    //   return {
    //     resources: knowledgeBaseFiles.map((filename) => ({
    //       name: filename,
    //       uri: `file://${filename}`,
    //       mimeType: Bun.file(filename).type,
    //     })),
    //   };
    // },
    complete: {
      filename: (value) => {
        return knowledgeBaseFiles.filter((filename) =>
          filename.startsWith(value),
        );
      },
    },
  }),
  {
    description: `
Retrieves the full contents of a knowledge base document.

Usage:
- Provide a valid document filename obtained from the search_knowledge tool.
- The resource returns the full text of that document.
- Use this resource after searching, before answering the user.`,
  },
  async (uri, { filename }): Promise<ReadResourceResult> => {
    console.log(
      `knowledge document resource call.\nuri: ${uri}, filename: ${filename}`,
    );
    if (!filename) {
      console.error(`File name not provided`);
      return { contents: [{ text: "Filename is required", uri: uri.href }] };
    }
    if (typeof filename !== "string") {
      console.error(`Invalid filename: ${filename} `);
      return { contents: [{ text: "Invalid filename", uri: uri.href }] };
    }
    if (!knowledgeBaseFiles.includes(filename)) {
      console.error(`File not found ${filename} `);
      return { contents: [{ text: "File not found", uri: uri.href }] };
    }

    const fileText = await readKBFile(filename);

    return {
      contents: [{ uri: uri.href, text: fileText }],
    };
  },
);

server.registerResource(
  "ticket_schema",
  "file:///ticket_schema.json",
  {
    description:
      "A resource that outlines what the structure of a ticket is supposed to look like",
  },
  async (uri): Promise<ReadResourceResult> => {
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(ticketSchema),
        },
      ],
    };
  },
);

// TODO: create ticket tool
server.registerTool(
  MCPServerTools.CREATE_TICKET_TOOL,
  {
    title: "Create Ticket",
    description: "Create a ticket for the users query",
    inputSchema: {
      ticket: z.any(),
      intent: z.enum(INTENT_NAMES),
    },
  },
  async (input): Promise<CallToolResult> => {
    const { ticket } = input;
    console.log(input);
    try {
      await createTicketUsecase.exec(ticket);
      return {
        content: [{ type: "text", text: "Ticket created successfully" }],
      };
    } catch (err) {
      console.error(err);
      return {
        content: [{ type: "text", text: "Error when creating ticket" }],
        isError: true,
      };
    }
  },
);

// TODO: update record tool

// TODO: send notification tool
