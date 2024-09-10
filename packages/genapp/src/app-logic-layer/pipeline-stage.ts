import { isLayerArtifact, LayerArtifact } from "../engine/layer-artifact";
import { GeneratorStage, GenerationContext } from "../engine/generator-stage-interface";
import { ArtifactSaver, GeneratedFilePathCalculator } from "../utils/artifact-saver";
import { ApplicationLayerGenerator } from "./strategy-interface";

export class ApplicationLayerStage implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private readonly _applicationLayerGeneratorStrategy: ApplicationLayerGenerator;

    constructor(saveBaseDir: string, layerGeneratorStrategy: ApplicationLayerGenerator) {
        this.artifactSaver = new ArtifactSaver(saveBaseDir, "/application-layer");
        this._applicationLayerGeneratorStrategy = layerGeneratorStrategy;
    }

    async generateStage(context: GenerationContext): Promise<LayerArtifact> {
        context._.pathResolver = this.artifactSaver as GeneratedFilePathCalculator;

        const appLayerArtifact = await this._applicationLayerGeneratorStrategy.generateApplicationLayer(context);

        console.log("AppLayerArtifact fragment: ", appLayerArtifact);

        if (!isLayerArtifact(appLayerArtifact)) {
            throw new Error("Could not generate application layer");
        }

        return appLayerArtifact;
    }
}