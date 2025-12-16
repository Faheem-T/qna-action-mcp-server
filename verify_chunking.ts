import { chunkDocument } from "./src/old/chunkers/documentChunker";
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

  console.log(`\nGenerated ${chunks.length} chunks:\n`);

  chunks.forEach((chunk, i) => {
    console.log(`--- Chunk ${i + 1} (Tokens: ${chunk.tokenCount}) ---`);
    console.log(`[Path: ${chunk.path.join(" > ")}]`);
    console.log(chunk.text);
    console.log("\n");
  });
}

main();
