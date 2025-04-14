import { OutputStream } from "./output-stream.ts";

type Callback = (stream: MemoryOutputStream) => void | null;

export class MemoryOutputStream implements OutputStream {
  private readonly onClose: Callback;

  private content = "";

  constructor(onClose: Callback = null) {
    this.onClose = onClose;
  }

  write(chunk: string): Promise<void> {
    this.content += chunk;
    return Promise.resolve();
  }

  getContent(): string {
    return this.content;
  }

  async close(): Promise<void> {
    if (this.onClose === null) {
      return;
    }
    this.onClose(this);
  }
}
