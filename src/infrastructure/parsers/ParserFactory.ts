import type { DocumentParser } from "../../domain/services/DocumentParser";
import type { IParserFactory } from "../../domain/services/IParserFactory";

export class ParserFactory implements IParserFactory {
  constructor(private parsers: DocumentParser[]) {}
  getParser(mimeType: string): DocumentParser {
    const parser = this.parsers.find((p) => p.supports(mimeType));
    if (!parser) throw new Error(`Unsupported file type: ${mimeType}`);
    return parser;
  }
}
