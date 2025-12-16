import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit, SKIP } from "unist-util-visit";
import type { DocumentParser } from "../../domain/services/DocumentParser";
import type { ParsedDocument, TextBlock } from "../../domain/entities/ParsedDocument";

function extractText(nodes: any[]): string {
  return nodes
    .map(
      (node: any) =>
        node.value || (node.children ? extractText(node.children) : ""),
    )
    .join("");
}

export class RemarkMarkdownParser implements DocumentParser {
  async parse(content: string, sourceId: string, fileType: string): Promise<ParsedDocument> {
    const tree = unified().use(remarkParse).use(remarkGfm).parse(content);

    const blocks: TextBlock[] = [];
    const headingStack: { depth: number; text: string }[] = [];
    let order = 0;

    visit(tree, (node: any) => {
      if (node.type === "heading") {
        const text = extractText(node.children).trim();

        while (headingStack.length && headingStack.at(-1)!.depth >= node.depth) {
          headingStack.pop();
        }

        headingStack.push({ depth: node.depth, text });

        blocks.push({
          type: "heading",
          text,
          level: node.depth,
          path: headingStack.map((h) => h.text),
          order: order++,
        });
      }

      if (node.type === "paragraph") {
        const text = extractText(node.children).trim();

        if (text.length < 30) return;

        blocks.push({
          type: "paragraph",
          text,
          path: headingStack.map((h) => h.text),
          order: order++,
        });
      }

      if (node.type === "code") {
        blocks.push({
          type: "code",
          text: node.value.trim(),
          path: headingStack.map((h) => h.text),
          order: order++,
        });
      }

      if (node.type === "list") {
        const text = node.children
          .map((listItem: any) => extractText(listItem.children).trim())
          .join(", ");

        if (text.length > 0) {
          blocks.push({
            type: "list",
            text,
            path: headingStack.map((h) => h.text),
            order: order++,
          });
        }
        return SKIP;
      }

      if (node.type === "table") {
        const rows = node.children.map((row: any) => {
          return (
            "| " +
            row.children
              .map((cell: any) => extractText(cell.children).trim())
              .join(" | ") +
            " |"
          );
        });
        const text = rows.join("\n");

        if (text.length > 0) {
          blocks.push({
            type: "table",
            text,
            path: headingStack.map((h) => h.text),
            order: order++,
          });
        }
        return SKIP;
      }
    });

    return {
      sourceId,
      fileType,
      blocks,
    };
  }
}
