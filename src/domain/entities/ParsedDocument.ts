export type TextBlock = {
  type: "paragraph" | "heading" | "list" | "code" | "table";
  text: string;
  path: string[];
  level?: number;
  order?: number;
};

export type ParsedDocument = {
  sourceId: string;
  fileType: string;
  blocks: TextBlock[];
};
