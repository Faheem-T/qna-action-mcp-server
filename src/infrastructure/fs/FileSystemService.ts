import type { IFileSystemService } from "../../domain/services/FileSystemService";
import { readdir } from "node:fs/promises";

export class FileSystemService implements IFileSystemService {
  getAllDirectoryFileNames = async (dir: string): Promise<string[]> => {
    const fileNames = await readdir(dir);

    return fileNames;
  };
}
