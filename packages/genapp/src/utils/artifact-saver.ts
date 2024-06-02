import * as fs from "fs";
import path from "path";
import { LayerArtifact } from "../engine/layer-artifact";

interface ArtifactSaverCache {
    savedArtifactsMap: { [artifactObject: string]: string; };
}

export const BaseArtifactSaver: ArtifactSaverCache = {
    savedArtifactsMap: {}
};

export class ArtifactSaver {

    private readonly _basePath: string;
    private readonly _globalBasePaths: string[];

    constructor(basePath: string) {
        this._basePath = basePath;
        this._globalBasePaths = ["generated", "src"];
    }

    getFullSavePath(filename: string): string {
        return path.posix.join(
            ...this._globalBasePaths,
            this._basePath,
            filename
        );
    }

    private isSaved(artifactObjectName: string): boolean {
        const saved = Object.keys(BaseArtifactSaver.savedArtifactsMap).includes(artifactObjectName);
        if (saved) {
            console.log(`Retrieving ${artifactObjectName} already saved in ${BaseArtifactSaver.savedArtifactsMap[artifactObjectName]}`);
        }
        return saved;
    }

    saveArtifact(artifact: LayerArtifact) {
        if (!artifact) {
            throw new Error("No artifact to be saved!");
        }

        console.log(`SAVING ${artifact.exportedObjectName} object`)
        if (this.isSaved(artifact.exportedObjectName)) {
            console.log(`${artifact.exportedObjectName} has been already saved. Restoring ...`)
            const savedFilepath = BaseArtifactSaver.savedArtifactsMap[artifact.exportedObjectName];

            if (!savedFilepath) {
                throw new Error(`"${artifact.exportedObjectName}" claims to be saved, but invalid filepath has been saved.`);
            }

            return {
                ...artifact,
                filePath: savedFilepath
            } as LayerArtifact;
        }

        if (artifact.dependencies) {
            artifact.dependencies = artifact.dependencies.map(dep => this.saveArtifact(dep));
        }

        const fullFilepath = this.getFullSavePath(artifact.filePath);
        fs.mkdir(path.dirname(fullFilepath), { recursive: true }, () => {
            fs.writeFileSync(fullFilepath, artifact.sourceText);
        });

        const absoluteFilepath = path.posix.resolve(fullFilepath)
        BaseArtifactSaver.savedArtifactsMap[artifact.exportedObjectName] = absoluteFilepath.substring(absoluteFilepath.indexOf("generated"));
        console.log("Generated cache: ", BaseArtifactSaver.savedArtifactsMap);

        // save actual path where the artifact has been saved
        artifact.filePath = fullFilepath;
        return {
            ...artifact,
            filepath: fullFilepath
        } as LayerArtifact;
    }
}
