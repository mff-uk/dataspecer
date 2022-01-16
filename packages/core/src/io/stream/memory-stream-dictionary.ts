import {StreamDictionary} from "./stream-dictionary";
import {MemoryOutputStream} from "./memory-output-stream";
import {MemoryInputStream} from "./memory-input-stream";
import {InputStream} from "./input-stream";
import {OutputStream} from "./output-stream";

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
