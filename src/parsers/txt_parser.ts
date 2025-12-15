import type { ParsedDocument, TextBlock } from "../types/ParsedDocument";

export async function txtParser(
  content: string,
  sourceId: string,
): Promise<ParsedDocument> {
  const blocks: TextBlock[] = content
    .split(/\n\s*\n/) // Split by empty lines (double newline)
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .map((text, index) => ({
      type: "paragraph",
      text,
      path: [],
      order: index,
    }));

  return {
    sourceId,
    fileType: "txt",
    blocks,
  };
}

// Test function
async function main() {
  const text = await Bun.file(import.meta.dir + "/../kb/sample.txt").text();
  const parsed = await txtParser(text, "sample.txt");
  console.log(JSON.stringify(parsed, null, 2));
}

// Check if running directly
if (import.meta.main) {
  main();
}
