import {OutputStream} from "./output-stream";

export class MemoryOutputStream implements OutputStream {

  private content = "";

  write(chunk: string): Promise<void> {
    this.content += chunk;
    return Promise.resolve();
  }

  getContent(): string {
    return this.content;
  }

}
