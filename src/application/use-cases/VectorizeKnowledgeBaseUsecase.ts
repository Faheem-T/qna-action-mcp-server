import type { IFileSystemService } from "../../domain/services/FileSystemService";
import { IngestDocumentUsecase } from "./IngestDocumentUsecase";

export class VectorizeKnowledgeBaseUsecase {
  constructor(
    private readonly _fileSystemService: IFileSystemService,
    private readonly _ingestDocumentUsecase: IngestDocumentUsecase,
  ) {}

  exec = async (knowledgeBaseDirectory: string) => {
    const kbFileNames = await this._fileSystemService.getAllDirectoryFileNames(
      knowledgeBaseDirectory,
    );

    for (const filename of kbFileNames) {
      const file = Bun.file(knowledgeBaseDirectory + "/" + filename);
      const mimeType = file.type;
      const content = await file.text();

      await this._ingestDocumentUsecase.exec(content, filename, mimeType);
    }
  };
}
