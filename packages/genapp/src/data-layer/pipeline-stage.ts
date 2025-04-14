import { ArtifactSaver } from "../utils/artifact-saver.ts";
import { DalGeneratorStrategy } from "./strategy-interface.ts";
import { LayerArtifact, isLayerArtifact } from "../engine/layer-artifact.ts";
import { GeneratorStage, type GenerationContext } from "../engine/generator-stage-interface.ts";

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