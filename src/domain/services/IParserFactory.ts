import type { DocumentParser } from "./DocumentParser";

export interface IParserFactory {
  getParser(mimeType: string): DocumentParser;
}
