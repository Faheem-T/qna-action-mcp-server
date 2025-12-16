import type { KBChunk } from "./KBChunk";

export type Document = {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  chunks: KBChunk[];
  createdAt: Date;
  updatedAt: Date;
};
