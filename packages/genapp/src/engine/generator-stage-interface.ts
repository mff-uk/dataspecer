import * as fs from "fs";
import path from "path";
import { LayerArtifact } from "./layer-artifact";
import { CapabilityConfiguration } from "../application-config";

export class ArtifactSaver {

    private readonly _basePath: string;
    private readonly _globalBasePaths: string[];
    private readonly _savedArtifactsMap: { [artifactObject: string]: string; };

    constructor(basePath: string) {
        this._basePath = basePath;
        this._globalBasePaths = ["generated", "src"];
        this._savedArtifactsMap = {};
    }

    getFullSavePath(filename: string): string {
        return path.posix.join(
            ...this._globalBasePaths,
            this._basePath,
            filename
        );
    }

    private isSaved(artifactObjectName: string): boolean {
        return artifactObjectName in Object.keys(this._savedArtifactsMap);
    }

    saveArtifact(artifact: LayerArtifact) {
        if (!artifact) {
            throw new Error("No artifact to be saved!");
        }

        if (this.isSaved(artifact.exportedObjectName)) {
            const savedFilepath = this._savedArtifactsMap[artifact.exportedObjectName];

            if (!savedFilepath) {
                throw new Error(`"${artifact.exportedObjectName}" claims to be saved, but invalid filepath has been saved.`);
            }

            return {
                ...artifact,
                fileName: savedFilepath
            } as LayerArtifact
        }

        if (artifact.dependencies) {
            artifact.dependencies.forEach(dep => this.saveArtifact(dep));
        }

        const filepath = this.getFullSavePath(artifact.fileName);

        console.log(`==== Saving artifact: ${filepath}`);

        const text = artifact.sourceText ? artifact.sourceText : "";

        fs.mkdir(path.dirname(filepath), { recursive: true }, () => {
            fs.writeFileSync(filepath, text);
        });
        
        console.log("==== Saved ====");
        this._savedArtifactsMap[artifact.exportedObjectName] = filepath;

        // save actual path where the artifact has been saved
        artifact.fileName = filepath;
    }
}

export type StageGenerationContext = { 
    aggregateName: string;
    config: CapabilityConfiguration;
    previousResult?: LayerArtifact;
};

export interface GeneratorStage {
    artifactSaver?: ArtifactSaver;
    generateStage(context: StageGenerationContext): Promise<LayerArtifact>;
}