export interface FileSystemWriter {
  writeString(path: string, data: string): Promise<void>;
}