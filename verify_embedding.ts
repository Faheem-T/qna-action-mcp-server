import { chunkDocument } from "./src/chunkers/documentChunker";
import { embedChunks } from "./src/embedder/embedChunks";
import { markdownParser } from "./src/parsers/markdown_parser";

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
  console.log(embeddings)
}

main();
