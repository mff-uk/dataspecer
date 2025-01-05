import { isLayerArtifact, LayerArtifact } from "../engine/layer-artifact";
import { GeneratorStage, GenerationContext } from "../engine/generator-stage-interface";
import { ArtifactSaver, GeneratedFilePathCalculator } from "../utils/artifact-saver";
import { ApplicationLayerGenerator } from "./strategy-interface";

/**
 * Class which represents the application layer generation "stage".
 * Implements the `GeneratorStage` interface to provide stage generation method.
 */
export class ApplicationLayerStage implements GeneratorStage {

    /**
     * An instance of `ArtifactSaver` used to save generated artifacts.
     */
    artifactSaver: ArtifactSaver;

    /**
     * Specific application layer generator to be called when this stage is being generated.
     */
    private readonly _applicationLayerGeneratorStrategy: ApplicationLayerGenerator;

    constructor(layerGeneratorStrategy: ApplicationLayerGenerator) {
        this.artifactSaver = new ArtifactSaver("/application-layer");
        this._applicationLayerGeneratorStrategy = layerGeneratorStrategy;
    }

    /**
     * Method responsible for the management of the application layer stage generation process.
     *
     * @param context - The generation context.
     * @returns A promise that resolves to a `LayerArtifact`.
     * @throws Will throw an error if the application layer could not be generated.
     */
    async generateStage(context: GenerationContext): Promise<LayerArtifact> {
        context._.pathResolver = this.artifactSaver as GeneratedFilePathCalculator;

        const appLayerArtifact = await this._applicationLayerGeneratorStrategy.generateApplicationLayer(context);

        if (!isLayerArtifact(appLayerArtifact)) {
            throw new Error("Could not generate application layer");
        }

        return appLayerArtifact;
    }
}