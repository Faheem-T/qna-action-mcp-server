export interface ParsedDocument {
  sourceId: string;
  fileType: "md" | "txt";
  blocks: TextBlock[];
}

export interface TextBlock {
  type: "heading" | "paragraph" | "code" | "list" | "table";
  text: string;
  level?: number;   // only for heading
  path: string[];   // semantic path
  order: number;
}
