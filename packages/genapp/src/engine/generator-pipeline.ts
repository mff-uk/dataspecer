import { GeneratorStage, StageGenerationContext } from "./generator-stage-interface";
import { LayerArtifact } from "./layer-artifact";

export class GeneratorPipeline {
    private readonly _pipelineStages: GeneratorStage[];
    private lastArtifact: LayerArtifact | undefined;

    constructor(...stages: GeneratorStage[]) {
        this._pipelineStages = stages;
    }

    async generateStages(context: StageGenerationContext): Promise<LayerArtifact> {

        for (const stage of this._pipelineStages) {
            const layerArtifact = await stage.generateStage(context);

            let layerOutput = layerArtifact;
            if (stage.artifactSaver) {
                const savedArtifact = stage.artifactSaver.saveArtifact(layerArtifact);
                // if layerArtifact had been saved before, the output will use actual saved path
                layerOutput = savedArtifact;
            }

            this.lastArtifact = layerOutput;
            context.previousResult = layerOutput;
        }

        if (!this.lastArtifact) {
            throw new Error("No artifact provided as output from the pipeline.");
        }

        return this.lastArtifact;
    }
}