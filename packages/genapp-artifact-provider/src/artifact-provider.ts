export class CodeGenerationArtifactMetadata {
    //private readonly map: { [key: string]: string; }
    readonly objectName: string;
    readonly objectFilepath: string;

    constructor(map: {[objectName: string]: string; }) {
        const entries = Object.entries(map);
        console.log("Entries: ", entries); 
        if (entries.length !== 1 || !entries[0]) {
            throw new Error("Incorrect mapping of generated objects");
        }

        const entry = entries[0];
        [this.objectName, this.objectFilepath] = entry;

        if (!this.objectName || !this.objectFilepath) {
            throw new Error("Incorrectly generated object");
        }
    }
}

export interface GeneratorArtifactProvider {
    generateArtifact: () => void;
    getGeneratedArtifactMapping: () => CodeGenerationArtifactMetadata;
}