import type { ParsedDocument } from "../../domain/entities/ParsedDocument";
import type { DocumentParser } from "../../domain/services/DocumentParser";
import type { TextBlock } from "../../domain/entities/ParsedDocument";

export class TextParser implements DocumentParser {
  supports = (mimeType: string): boolean => mimeType.startsWith("text/plain");

  parse = async (
    content: string,
    sourceId: string,
    fileType: string,
  ): Promise<ParsedDocument> => {
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
      fileType,
      blocks,
    };
  };
}
