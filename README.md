# QnA Action MCP Server

An intelligent MCP (Model Context Protocol) server designed to empower LLMs with RAG-based Q&A capabilities and actionable ticketing features.

## Overview

This project provides a robust backend for LLMs to act as intelligent agents. It features:
-   **Config-Driven Architecture**: Adaptable to any industry or domain simply by changing configuration files.
-   **RAG (Retrieval-Augmented Generation)**: Embeds your custom knowledge base for accurate, context-aware answers.
-   **Actionable Capabilities**: Equipped with tools to perform actions like creating tickets directly from user interactions.

## Prerequisites

-   [Bun](https://bun.sh/) (or Node.js)
-   PostgreSQL database

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## Usage

### Quick Start

1. [Create the configuration files](#1-configuration-srcconfigs)
2. [Place the knowledge base documents in the kb/ folder](#2-knowledge-base-srckb)
3. [Run `bun run vectorize_kb` script](#3-scripts)
4. [Run `bun start`](#3-scripts)

### 1. Configuration (`src/configs`)

This server is fully config-driven. You must define your application behavior in `src/configs`.

**Step 1: Create `config.yaml`**
This is the entry point that points to other specific config files.

```yaml
files:
  intents: "intents.yaml"
  persona: "persona.yaml"
  knowledge_base_index: "kb_index.yaml"
  ticketing: "ticketing.yaml"
```

**Step 2: Create referenced config files**

*   **`intents.yaml`**: Define user intents and allowed tools.
    ```yaml
    intents:
      - name: support_query
        description: "User asks a support question"
        allowed_tools: ["search_knowledge_base"]
        risk_level: "low"
    ```

*   **`persona.yaml`**: Define the AI's personality and system prompts.
    ```yaml
    default: "support_agent"
    personas:
      support_agent:
        system_prompt: "You are a helpful support agent..."
        max_response_tokens: 1000
    ```

*   **`kb_index.yaml`**: Configure the knowledge base backend.
    ```yaml
    knowledge_base:
      backend: "local"   # or 'api'
      documents_path: "src/kb"
    ```

*   **`ticketing.yaml`**: Configure the ticketing system integration.
    ```yaml
    schema: "ticket_schema.json"
    endpoint: "https://api.example.com/tickets"
    method: "POST"
    ```

**Step 3: Create `ticket_schema.json` under `src/configs/schemas`**
  
```json
// `src/configs/schemas/ticket_schema.json`
{
  "type": "object",
  "required": ["category", "priority", "summary", "description", "source"],
  "additionalProperties": false,
  "properties": {
    "category": {
      "type": "string",
      "enum": ["bug", "outage", "access", "billing", "other"]
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high", "critical"]
    },
    "summary": {
      "type": "string",
      "minLength": 5,
      "maxLength": 120
    },
    "description": {
      "type": "string",
      "minLength": 20
    },
    "source": {
      "const": "llm_generated"
    }
  }
}
```

### 2. Knowledge Base (`src/kb`)

Place all your knowledge base documents (Markdown, Text, etc.) inside the `src/kb` folder (or the path configured in `kb_index.yaml`).

> **Note:** Currently supported document formats are Markdown (`.md`) and Text (`.txt`).


### 3. Scripts

Run the following commands using Bun:

*   **Embed Knowledge Base**:
    Converts your documents in `src/kb` into vector embeddings for RAG.
    ```bash
    bun run vectorize_kb
    ```

*   **Start Server**:
    Starts the MCP server.
    ```bash
    bun start
    ```

## Tools & Resources

This MCP server exposes the following capabilities to connected clients:

### Tools
-   **`search_knowledge_base`**: Performs a semantic search over the vectorized knowledge base to answer user queries.
    -   *Input*: `query` (string), `k` (number of results)
-   **`create_ticket`**: Creates a support ticket based on the conversation context.
    -   *Input*: `ticket` (object matching your ticket schema)

### Resources
-   **`intents`**: (`file:///intents.json`) Returns the configured user intents.
-   **`persona`**: (`file:///persona.json`) Returns the active AI persona configuration.
-   **`knowledge`**: (`file://{filename}`) Direct access to read specific knowledge base files.
-   **`ticket_schema`**: (`file:///ticket_schema.json`) Returns the schema definition for creating tickets.

## Todo

- [ ] Add notification tool
- [ ] Add update record tool
- [ ] Add chunk scoring for vector search
