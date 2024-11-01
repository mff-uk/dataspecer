import { ArtifactSaver } from "../utils/artifact-saver";
import { DalGeneratorStrategy } from "./strategy-interface";
import { LayerArtifact, isLayerArtifact } from "../engine/layer-artifact";
import { GeneratorStage, type GenerationContext } from "../engine/generator-stage-interface";

export class DataLayerGeneratorStage implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private readonly _dalGeneratorStrategy: DalGeneratorStrategy;

    constructor(dalGeneratorStrategy: DalGeneratorStrategy) {
        this._dalGeneratorStrategy = dalGeneratorStrategy;
        this.artifactSaver = new ArtifactSaver("/data-layer");
    }

    async generateStage(context: GenerationContext): Promise<LayerArtifact> {

        context._.pathResolver = this.artifactSaver;

        const dalArtifact = await this._dalGeneratorStrategy.generateDataLayer(context);

        if (!isLayerArtifact(dalArtifact)) {
            throw new Error("Could not generate application data layer");
        }

        return dalArtifact;
    }
}