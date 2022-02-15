export interface OutputStream {
  write(chunk: string): Promise<void>;

  /**
   * After this call no other action can be invoked.
   */
  close(): Promise<void>;
}
