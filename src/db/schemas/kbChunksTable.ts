import type { InferSelectModel } from "drizzle-orm";
import { jsonb, pgTable, text, uuid, vector } from "drizzle-orm/pg-core";

export const kbChunksTable = pgTable("kb_chunks", {
  id: uuid()
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  content: text().notNull(),
  embedding: vector({ dimensions: 3072 }).notNull(),
  source: text().notNull(),
  metadata: jsonb(),
});

export type KbChunksTableType = InferSelectModel<typeof kbChunksTable>;
