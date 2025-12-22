import { vectorizeKnowledgeBaseUseCase } from "../di";
import { knowledgeBaseDir } from "../presentation/mcp/server";

export async function vectorizeKnowledgeBase() {
  await vectorizeKnowledgeBaseUseCase.exec(knowledgeBaseDir);
  console.log("Vectorization completed successfully");
}

vectorizeKnowledgeBase();
