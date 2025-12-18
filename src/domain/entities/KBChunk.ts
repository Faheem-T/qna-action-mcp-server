export type KBChunk = {
  text: string;
  embedding?: number[];
  metadata: Record<string, any>;
};
