import * as fs from "fs";
import path from "path";
import { LayerArtifact } from "../engine/layer-artifact";

interface ArtifactSaverCache {
    savedArtifactsMap: { [artifactObject: string]: string; };
}

export const BaseArtifactSaver: ArtifactSaverCache = {
    savedArtifactsMap: {}
};

export interface GeneratedFilePathCalculator {
    getFullSavePath(filename: string): string;
}

export class ArtifactSaver implements GeneratedFilePathCalculator {

    private readonly _layerSubdirectoryPath: string;
    private readonly _globalBasePaths: string[];

    constructor(saveBaseDir: string, layerPath: string) {
        this._layerSubdirectoryPath = layerPath;

        const baseDirectoryPath = this.getSaveBaseDirectoryPath(saveBaseDir);
        this._globalBasePaths = [baseDirectoryPath, "generated", "src"];
    }

    private getSaveBaseDirectoryPath(baseDirPath: string): string {

        if (!fs.existsSync(baseDirPath)) {
            const createdDir = fs.mkdirSync(baseDirPath, { recursive: true })!;
            return path.posix.normalize(createdDir);
        }

        return fs.statSync(baseDirPath).isDirectory()
            ? path.posix.normalize(baseDirPath)
            : path.posix.dirname(baseDirPath);
    }

    getFullSavePath(filename: string): string {
        return path.posix.join(
            ...this._globalBasePaths,
            this._layerSubdirectoryPath,
            filename
        );
    }

    private isSaved(artifactObjectName: string): boolean {
        return artifactObjectName in BaseArtifactSaver.savedArtifactsMap;
    }

    saveArtifact(artifact: LayerArtifact) {
        if (!artifact) {
            throw new Error("No artifact to be saved!");
        }

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

        console.log(`SAVING ${artifact.exportedObjectName} object`);
        if (artifact.dependencies) {
            artifact.dependencies = artifact.dependencies.map(dep => this.saveArtifact(dep));
        }

        const fullFilepath = this.getFullSavePath(artifact.filePath);
        fs.mkdir(path.dirname(fullFilepath), { recursive: true }, () => {
            fs.writeFileSync(fullFilepath, artifact.sourceText);
        });

        const absoluteFilepath = path.posix.resolve(fullFilepath)
        BaseArtifactSaver.savedArtifactsMap[artifact.exportedObjectName] = absoluteFilepath.substring(absoluteFilepath.indexOf("generated"));

        // save actual path where the artifact has been saved
        artifact.filePath = fullFilepath;
        return {
            ...artifact,
            filePath: fullFilepath
        } as LayerArtifact;
    }

    copy(templatesDirPath: string) {
        templatesDirPath = path.join(__dirname, "..", "templates", templatesDirPath);

        if (!fs.existsSync(templatesDirPath) || !fs.statSync(templatesDirPath).isDirectory()) {
            throw new Error("Templates directory does not exist");
        }

        const filePaths = fs.readdirSync(templatesDirPath, { recursive: true });

        console.log(filePaths);

        filePaths.forEach(filePath => {
            const filename = filePath as string;
            const source = path.posix.join(templatesDirPath, filename);
            const target = this.getFullSavePath(filename);

            fs.copyFileSync(source, target);
        });
    }
}
