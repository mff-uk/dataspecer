
export interface OutputStream {

    write(chunk: string): Promise<void>;

}
