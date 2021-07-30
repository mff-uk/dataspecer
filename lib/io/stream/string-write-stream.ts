import {WritableObject} from "./writable-object";

export class StringWriteStream implements WritableObject {
    private content = "";

    write(chunk: string): void {
      this.content += chunk;
    }

    close(): void {
      return;
    }

    getContent(): string {
      return this.content;
    }
}
