import { chunkDocument } from "./src/old/chunkers/documentChunker";
import { db } from "./src/old/db/db";
import { kbChunksTable } from "./src/old/db/schemas/kbChunksTable";
import { embedChunks } from "./src/old/embedder/embedChunks";
import { markdownParser } from "./src/old/parsers/markdown_parser";

async function main() {
  const text = await Bun.file(
    import.meta.dir + "/src/kb/complex_test.md",
  ).text();

  console.log("Parsing document...");
  const parsed = await markdownParser(text, "complex_test.md");

  console.log(`Document parsed. Total blocks: ${parsed.blocks.length}`);

  console.log("Chunking document (Max: 100 tokens, Overlap: 20 tokens)...");
  // Using small limits to force splitting on our sample file
  const chunks = chunkDocument(parsed, 100, 20);

  const embeddings = await embedChunks(chunks);

  console.log(`Document embedded. Total embeddings: ${embeddings?.length}`);

  await db.insert(kbChunksTable).values(
    embeddings.map((embedding, index) => ({
      id: crypto.randomUUID(),
      content: chunks[index]!.text,
      embedding,
      source: chunks[index]!.sourceId,
    })),
  );

  console.log(await db.select().from(kbChunksTable));
}

main();
