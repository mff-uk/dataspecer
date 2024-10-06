import * as fs from "fs";
import path from "path";
import { GenappEnvConfig } from "../engine/app-generator";
import { LayerArtifact } from "../engine/layer-artifact";

interface ArtifactSaverCache {
    savedArtifactsMap: { [artifactObject: string]: string; };
    resetCacheContent: () => void;
}

export const ArtifactCache: ArtifactSaverCache = {
    savedArtifactsMap: {},
    resetCacheContent: function (): void {
        Object.keys(this.savedArtifactsMap)
            .forEach(k => {
                delete this.savedArtifactsMap[k];
            })
    }
};

export interface GeneratedFilePathCalculator {
    getFullSavePath(filename: string, artifactName?: string): string;
}

export class ArtifactSaver implements GeneratedFilePathCalculator {

    private _layerSubdirectoryPath: string;
    private readonly _globalBasePaths: string[];

    constructor(layerPath: string) {

        const baseDirectory: string = GenappEnvConfig.TmpOutDir;
        this._layerSubdirectoryPath = layerPath;
        this._globalBasePaths = [baseDirectory, "src"];
    }

    getFullSavePath(filename: string, artifactName?: string): string {

        if (artifactName && this.isSaved(artifactName)) {
            return ArtifactCache.savedArtifactsMap[artifactName]!;
        }

        return path.posix.join(
            ...this._globalBasePaths,
            this._layerSubdirectoryPath,
            filename
        );
    }

    private isSaved(artifactObjectName: string): boolean {
        return artifactObjectName in ArtifactCache.savedArtifactsMap;
    }

    saveArtifact(artifact: LayerArtifact) {
        if (!artifact) {
            throw new Error("No artifact to be saved!");
        }

        if (this.isSaved(artifact.exportedObjectName)) {
            console.log(`${artifact.exportedObjectName} has been already saved. Restoring ...`)
            const savedFilepath = ArtifactCache.savedArtifactsMap[artifact.exportedObjectName];

            if (!savedFilepath) {
                throw new Error(`"${artifact.exportedObjectName}" claims to be saved, but invalid filepath has been saved.`);
            }

            return {
                ...artifact,
                filePath: savedFilepath
            } as LayerArtifact;
        }

        console.log(`SAVING ${artifact.exportedObjectName} object`);
        if (artifact.dependencies) {
            artifact.dependencies = artifact.dependencies.map(dep => this.saveArtifact(dep));
        }

        const fullFilepath = this.getFullSavePath(artifact.filePath, artifact.exportedObjectName);
        console.log(`   ${artifact.exportedObjectName} fullpath: `, fullFilepath);
        fs.mkdir(path.dirname(fullFilepath), { recursive: true }, () => {
            fs.writeFileSync(fullFilepath, artifact.sourceText);
        });

        ArtifactCache.savedArtifactsMap[artifact.exportedObjectName] = fullFilepath;

        // save actual path where the artifact has been saved
        artifact.filePath = fullFilepath;
        return {
            ...artifact,
            filePath: fullFilepath
        } as LayerArtifact;
    }

    copy(templatesDirPath: string) {
        templatesDirPath = path.join(__dirname, "..", "..", "templates", templatesDirPath);

        if (!fs.existsSync(templatesDirPath) || !fs.statSync(templatesDirPath).isDirectory()) {
            throw new Error("Templates directory does not exist");
        }

        const filePaths = fs.readdirSync(templatesDirPath, { recursive: false });

        console.log(filePaths);

        const layerSubdirBackup = this._layerSubdirectoryPath
        this._layerSubdirectoryPath = "..";

        filePaths.forEach(filePath => {
            const filename = filePath as string;
            const source = path.posix.join(templatesDirPath, filename);
            const target = this.getFullSavePath(filename);

            fs.cpSync(source, target, { recursive: true });
        });

        this._layerSubdirectoryPath = layerSubdirBackup;
    }
}
