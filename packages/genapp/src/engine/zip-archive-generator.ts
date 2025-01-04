import archiver from "archiver";
import { once } from "events";
import * as fs from "fs";

export class ZipArchiveGenerator {

    private readonly _outDir: string;
    private readonly _outFile: string;

    constructor(outDir: string, outFile: string) {
        this._outDir = outDir;
        this._outFile = outFile;
    }

    async generateZipArchive(tempZipFilename: string) {
        const output = fs.createWriteStream(tempZipFilename);
        const zipArchive = archiver("zip", {
            statConcurrency: 2,
            zlib: { level: 9 }
        });

        output.on("close", () => { console.log(`${zipArchive.pointer()} B written`); });

        zipArchive.on("warning", function (err) {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });

        zipArchive.on("error", err => { throw err; });

        zipArchive.pipe(output);
        zipArchive.directory(`${this._outDir}/`, "generatedApp");
        return zipArchive.finalize();
    }

    async getZipBuffer(tempZipFilename: string): Promise<Buffer> {
        const readStream = fs.createReadStream(tempZipFilename);
        const buffers: Buffer[] = [];

        readStream.on("data", (d: any) => { buffers.push(Buffer.from(d)); });

        await once(readStream, "end");

        return Buffer.concat(buffers);
    }
}
