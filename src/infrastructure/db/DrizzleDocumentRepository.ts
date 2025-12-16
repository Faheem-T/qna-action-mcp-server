import type { DocumentRepository } from "../../domain/repositories/DocumentRepository";
import type { KBChunk } from "../../domain/entities/KBChunk";
import { db } from "../../old/db/db";
import { kbChunksTable } from "../../old/db/schemas/kbChunksTable";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";

export class DrizzleDocumentRepository implements DocumentRepository {
  async saveChunks(chunks: KBChunk[], source: string): Promise<void> {
    const records = chunks.map((chunk) => ({
      content: chunk.text,
      embedding: chunk.embedding!, // Assumed embedding is present
      source: source,
      metadata: chunk.metadata,
    }));

    // Chunking inserts if necessary, but for now simple insert
    if (records.length > 0) {
      await db.insert(kbChunksTable).values(records);
    }
  }

  async findSimilarChunks(embedding: number[], k: number = 5): Promise<KBChunk[]> {
    const similarity = sql<number>`1 - (${cosineDistance(
      kbChunksTable.embedding,
      embedding
    )})`;

    const results = await db
      .select({
        text: kbChunksTable.content,
        embedding: kbChunksTable.embedding,
        metadata: kbChunksTable.metadata,
        score: similarity,
      })
      .from(kbChunksTable)
      .orderBy(desc(similarity))
      .limit(k);

    return results.map((r) => ({
      text: r.text,
      embedding: r.embedding,
      metadata: r.metadata as Record<string, any>,
    }));
  }
}
