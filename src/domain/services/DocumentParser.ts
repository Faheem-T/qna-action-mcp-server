import type { ParsedDocument } from "../entities/ParsedDocument";

export interface DocumentParser {
  parse(
    content: string,
    sourceId: string,
    fileType: string,
  ): Promise<ParsedDocument>;
}
