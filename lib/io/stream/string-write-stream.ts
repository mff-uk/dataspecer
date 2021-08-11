import {Writable} from "./writable";

export class StringWriteStream implements Writable {
    private content = "";

    async write(chunk: string): Promise<void> {
      this.content += chunk;
    }

    getContent(): string {
      return this.content;
    }
}
