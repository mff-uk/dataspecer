export interface Writable {
    write(chunk: string): Promise<void>;
}
