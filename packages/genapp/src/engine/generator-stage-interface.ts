import * as fs from "fs";
import path from "path";
import { LayerArtifact } from "./layer-artifact";

export class ArtifactSaver {

    private readonly basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    saveArtifact(artifact: LayerArtifact) {
        if (!artifact) {
            throw new Error("No artifact to be saved!");
        }

        const filepath = path.join(
            ".",
            "generated",
            "src",
            this.basePath,
            artifact.fileName
        );

        console.log(`==== Saving artifact: ${filepath}`);

        if (!artifact.sourceText) {
            return;
        }

        const text = artifact.sourceText;

        fs.mkdir(path.dirname(filepath), { recursive: true }, () => {
            fs.writeFileSync(filepath, text);
        });
        
        console.log("==== Saved ====");
    }
}

export type FirstStageGenerationContext = {
    aggregateName: string;
};

export type NextStageGenerationContext = 
    FirstStageGenerationContext & { 
        previousResult: LayerArtifact 
    };

export type StageGenerationContext = FirstStageGenerationContext | NextStageGenerationContext;

export interface GeneratorStage {
    artifactSaver?: ArtifactSaver;
    generateStage<TContext extends StageGenerationContext>(context: TContext): Promise<LayerArtifact>;
}