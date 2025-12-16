export interface IFileSystemService {
  getAllDirectoryFileNames(dir: string): Promise<string[]>;
}
