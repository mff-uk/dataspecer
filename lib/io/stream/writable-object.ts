/**
 * Interface for core functionality of write streams.
 */
export interface WritableObject {
    write(chunk: string);
    close();
}
