import JSZip from "jszip";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary";
import {InputStream} from "@dataspecer/core/io/stream/input-stream";
import {OutputStream} from "@dataspecer/core/io/stream/output-stream";

export class ZipStreamDictionary implements StreamDictionary {
    private readonly zip: JSZip;

    public constructor() {
        this.zip = new JSZip();
    }

    exists(path: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    list(): Promise<string[]> {
        throw new Error("Method not implemented.");
    }

    readPath(path: string): InputStream {
        throw new Error("Method not implemented.");
    }

    writePath(path: string): OutputStream {
        const parts: (Blob | string)[] = [];
        return {
            // @ts-ignore
            write: (data: Blob | string) => {
                parts.push(data);
            },
            close: async (): Promise<void> => {
                this.zip.file(path, new Blob(parts));
            }
        };
    }

    public save(): Promise<Blob> {
        return this.zip.generateAsync({type: "blob"});
    }
}
