import { isLayerArtifact, LayerArtifact } from "../engine/layer-artifact.ts";
import { GeneratorStage, GenerationContext } from "../engine/generator-stage-interface.ts";
import { ArtifactSaver, GeneratedFilePathCalculator } from "../utils/artifact-saver.ts";
import { ApplicationLayerGenerator } from "./strategy-interface.ts";

export class ApplicationLayerStage implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private readonly _applicationLayerGeneratorStrategy: ApplicationLayerGenerator;

    constructor(layerGeneratorStrategy: ApplicationLayerGenerator) {
        this.artifactSaver = new ArtifactSaver("/application-layer");
        this._applicationLayerGeneratorStrategy = layerGeneratorStrategy;
    }

    async generateStage(context: GenerationContext): Promise<LayerArtifact> {
        context._.pathResolver = this.artifactSaver as GeneratedFilePathCalculator;

        const appLayerArtifact = await this._applicationLayerGeneratorStrategy.generateApplicationLayer(context);

        if (!isLayerArtifact(appLayerArtifact)) {
            throw new Error("Could not generate application layer");
        }

        return appLayerArtifact;
    }
}