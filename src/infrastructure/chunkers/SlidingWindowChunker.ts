import { getEncoding } from "js-tiktoken";
import type { DocumentChunker } from "../../domain/services/DocumentChunker";
import type { ParsedDocument, TextBlock } from "../../domain/entities/ParsedDocument";
import type { KBChunk } from "../../domain/entities/KBChunk";

const enc = getEncoding("cl100k_base");
const MAX_TOKENS = 512;
const OVERLAP_TOKENS = 50;

type TokenizedBlock = {
  block: TextBlock;
  tokens: number[];
};

function arePathsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function normalizeBlocks(
  blocks: TextBlock[],
  maxTokens: number,
  overlap: number,
): TokenizedBlock[] {
  const result: TokenizedBlock[] = [];

  for (const block of blocks) {
    const tokens = enc.encode(block.text);

    if (tokens.length <= maxTokens) {
      result.push({ block, tokens });
      continue;
    }

    let start = 0;
    while (start < tokens.length) {
      const end = Math.min(start + maxTokens, tokens.length);
      const slice = tokens.slice(start, end);

      result.push({
        block: {
          ...block,
          text: enc.decode(slice),
          type: "paragraph", // semantic degradation is explicit
        },
        tokens: slice,
      });

      if (end === tokens.length) break;
      start += maxTokens - overlap;
    }
  }

  return result;
}

export class SlidingWindowChunker implements DocumentChunker {
  chunk(document: ParsedDocument): KBChunk[] {
    const chunks: KBChunk[] = [];
    const blocks = normalizeBlocks(document.blocks, MAX_TOKENS, OVERLAP_TOKENS);

    let bufferTokens: number[] = [];
    let bufferBlocks: TextBlock[] = [];

    function flush() {
      if (bufferBlocks.length === 0) return;

      chunks.push({
        text: bufferBlocks.map((b) => b.text).join("\n\n"),
        metadata: {
          id: crypto.randomUUID(),
          tokenCount: bufferTokens.length,
          path: bufferBlocks[0]!.path,
          sourceId: document.sourceId,
        },
      });

      bufferTokens = [];
      bufferBlocks = [];
    }

    function seedWithOverlap(prevTokens: number[], prevBlock: TextBlock) {
      const overlapSlice = prevTokens.slice(-overlap);

      bufferTokens = overlapSlice;
      bufferBlocks = [
        {
          ...prevBlock,
          text: enc.decode(overlapSlice),
          type: "paragraph",
        },
      ];
    }
    
    // Using strict var for helper access closure
    const overlap = OVERLAP_TOKENS;

    for (const { block, tokens } of blocks) {
      // Path change forces clean break
      if (
        bufferBlocks.length > 0 &&
        !arePathsEqual(block.path, bufferBlocks[0]!.path)
      ) {
        flush();
      }

      // If block doesn't fit, flush and seed overlap
      if (bufferTokens.length + tokens.length > MAX_TOKENS) {
        const prevTokens = bufferTokens;
        const prevBlock = bufferBlocks[bufferBlocks.length - 1];

        flush();

        if (prevTokens.length > 0 && prevBlock) {
          seedWithOverlap(prevTokens, prevBlock);
        }

        // STILL doesn't fit → must flush again (no overlap)
        if (bufferTokens.length + tokens.length > MAX_TOKENS) {
          flush();
        }
      }

      // At this point it MUST fit
      if (tokens.length > MAX_TOKENS) {
        throw new Error("Invariant violation: oversized block");
      }

      bufferTokens = bufferTokens.concat(tokens);
      bufferBlocks.push(block);
    }

    flush();
    return chunks;
  }
}
