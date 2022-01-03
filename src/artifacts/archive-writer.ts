import JSZip from "jszip";

export interface ArchiveWriter {
    file(filename: string, data: Blob | string): Promise<void>;

    directory(dirname: string): ArchiveWriter;
}

export class ZipWriter {
    private readonly zip: JSZip;

    constructor() {
        this.zip = new JSZip();
    }

    getRoot(): ZipWriterDirectory {
        return new (ZipWriterDirectory)('', this.zip);
    }

    public write(): Promise<Blob> {
        return this.zip.generateAsync({type: "blob"});
    }
}

export class ZipWriterDirectory implements ArchiveWriter {
    private path: string;
    private zip: JSZip;

    /**
     * @internal
     */
    public constructor(path: string, zip: JSZip) {
        this.path = path;
        this.zip = zip;
    }

    public async file(filename: string, data: Blob | string): Promise<void> {
        this.zip.file(this.path + filename, data);
    }

    public directory(dirname: string): ZipWriterDirectory {
        return new ZipWriterDirectory(this.path + dirname + '/', this.zip);
    }
}
