import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary";
import {InputStream} from "@dataspecer/core/io/stream/input-stream";
import * as fs from "fs";
import {OutputStream} from "@dataspecer/core/io/stream/output-stream";
import {MemoryOutputStream} from "@dataspecer/core/io/stream/memory-output-stream";
import * as Path from "path";

export class FileStreamDictionary implements StreamDictionary {
    readPath(path: string): InputStream {
        throw Error("Method not implemented.");
    }

    writePath(path: string): OutputStream {
        return new MemoryOutputStream((stream) => {
            fs.mkdirSync(Path.dirname("./" + path), { recursive: true });
            fs.writeFileSync("./" + path, stream.getContent());
        });
    }

    async exists(path: string): Promise<boolean> {
        throw Error("Method not implemented.");
    }

    async list(): Promise<string[]> {
        throw Error("Method not implemented.");
    }
}
