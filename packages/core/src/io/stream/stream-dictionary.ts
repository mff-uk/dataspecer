import { InputStream } from "./input-stream.ts";
import { OutputStream } from "./output-stream.ts";

export interface StreamDictionary {
  readPath(path: string): InputStream;

  writePath(path: string): OutputStream;

  /**
   * Check if stream with given path exists.
   */
  exists(path: string): Promise<boolean>;

  /**
   * List stored files.
   */
  list(): Promise<string[]>;
}
