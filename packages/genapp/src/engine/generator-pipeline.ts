import { GenerationContext, GeneratorStage } from "./generator-stage-interface.ts";
import { LayerArtifact } from "./layer-artifact.ts";

export class GeneratorPipeline {
    private readonly _pipelineStages: GeneratorStage[];
    private _pipelineOutputArtifact: LayerArtifact | undefined;

    constructor(...stages: GeneratorStage[]) {
        this._pipelineStages = stages;
    }

    async generateStages(context: GenerationContext): Promise<LayerArtifact> {

        if (!this._pipelineStages || this._pipelineStages.length === 0) {
            throw new Error("No stages to be generated");
        }

        for (const stage of this._pipelineStages) {
            const layerArtifact = await stage.generateStage(context);

            let layerOutput = layerArtifact;
            if (stage.artifactSaver) {
                const savedArtifact = stage.artifactSaver.saveArtifact(layerArtifact);
                // if layerArtifact had been saved before, the output will use actual saved path
                layerOutput = savedArtifact;
            }

            this._pipelineOutputArtifact = layerOutput;
            context.previousResult = layerOutput;
        }

        return this._pipelineOutputArtifact!;
    }
}