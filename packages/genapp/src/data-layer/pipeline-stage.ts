import { ArtifactSaver } from "../utils/artifact-saver";
import { DalGeneratorStrategy } from "./strategy-interface";
import { LayerArtifact, isLayerArtifact } from "../engine/layer-artifact";
import { GeneratorStage, type GenerationContext } from "../engine/generator-stage-interface";

/**
 * Class which represents the data layer generation "stage".
 * Implements the `GeneratorStage` interface to provide stage generation method.
 */
export class DataLayerGeneratorStage implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private readonly _dalGeneratorStrategy: DalGeneratorStrategy;

    constructor(dalGeneratorStrategy: DalGeneratorStrategy) {
        this._dalGeneratorStrategy = dalGeneratorStrategy;
        this.artifactSaver = new ArtifactSaver("/data-layer");
    }

    /**
     * Method responsible for handling of the data layer stage generation process.
     *
     * @param context - The generation context.
     * @returns A promise that resolves to a `LayerArtifact` instance which contains data about the main generated artifact of this layer.
     * @throws Will throw an error if the data layer could not be generated.
     */
    async generateStage(context: GenerationContext): Promise<LayerArtifact> {

        context._.pathResolver = this.artifactSaver;

        const dalArtifact = await this._dalGeneratorStrategy.generateDataLayer(context);

        if (!isLayerArtifact(dalArtifact)) {
            throw new Error("Could not generate application data layer");
        }

        return dalArtifact;
    }
}