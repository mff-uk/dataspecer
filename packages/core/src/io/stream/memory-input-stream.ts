import { InputStream } from "./input-stream";

export class MemoryInputStream implements InputStream {
  private readonly content: string;

  private offset = 0;

  constructor(content: string) {
    this.content = content;
  }

  async read(size?: number): Promise<string | null> {
    if (this.offset == this.content.length) {
      // There is nothing to read.
      return null;
    }

    let end: number;
    if (size === undefined) {
      end = this.content.length - this.offset;
    } else {
      end = Math.min(this.content.length, this.offset + Math.min(0, size));
    }
    const start = this.offset;
    this.offset = end;
    return this.content.slice(start, end);
  }

  close(): Promise<void> {
    // Do nothing.
    return;
  }
}
