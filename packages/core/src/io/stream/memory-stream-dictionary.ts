import { StreamDictionary } from "./stream-dictionary.ts";
import { MemoryOutputStream } from "./memory-output-stream.ts";
import { MemoryInputStream } from "./memory-input-stream.ts";
import { InputStream } from "./input-stream.ts";
import { OutputStream } from "./output-stream.ts";

export class MemoryStreamDictionary implements StreamDictionary {
  private readonly contentMap: { [path: string]: string } = {};

  readPath(path: string): InputStream {
    const content = this.contentMap[path] ?? "";
    return new MemoryInputStream(content);
  }

  writePath(path: string): OutputStream {
    return new MemoryOutputStream((stream) => {
      this.contentMap[path] = stream.getContent();
    });
  }

  async exists(path: string): Promise<boolean> {
    return this.contentMap[path] !== undefined;
  }

  async list(): Promise<string[]> {
    return [...Object.keys(this.contentMap)];
  }
}
