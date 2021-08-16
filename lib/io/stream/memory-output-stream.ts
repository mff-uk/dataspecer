import {OutputStream} from "./output-stream";

export class MemoryOutputStream implements OutputStream {

    private content = "";

    async write(chunk: string): Promise<void> {
      this.content += chunk;
    }

    getContent(): string {
      return this.content;
    }

}
