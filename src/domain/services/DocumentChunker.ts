import type { ParsedDocument } from "../entities/ParsedDocument";
import type { KBChunk } from "../entities/KBChunk";

export interface DocumentChunker {
  chunk(document: ParsedDocument): KBChunk[];
}
