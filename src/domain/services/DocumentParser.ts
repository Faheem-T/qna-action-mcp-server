import type { ParsedDocument } from "../entities/ParsedDocument";

export interface DocumentParser {
  supports(mimeType: string): boolean;
  parse(
    content: string,
    sourceId: string,
    fileType: string,
  ): Promise<ParsedDocument>;
}
