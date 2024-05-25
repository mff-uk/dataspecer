import { GeneratorStage, StageGenerationContext } from "./generator-stage-interface";
import { LayerArtifact } from "./layer-artifact";

export class GeneratorPipeline {
    private readonly pipelineStages: GeneratorStage[];
    private lastArtifact: LayerArtifact | undefined;

    constructor(...stages: GeneratorStage[]) {
        this.pipelineStages = stages;
    }

    async generateStages(context: StageGenerationContext): Promise<LayerArtifact> {

        for (const stage of this.pipelineStages) {
            const layerArtifact = await stage.generateStage(context);

            if (stage.artifactSaver) {
                stage.artifactSaver.saveArtifact(layerArtifact);
            }

            this.lastArtifact = layerArtifact;
            context.previousResult = layerArtifact;
        }

        if (!this.lastArtifact) {
            throw new Error("No artifact provided as output from the pipeline.");
        }

        return this.lastArtifact;
    }
}