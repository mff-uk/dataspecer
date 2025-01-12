import { ArtifactSaver, GeneratedFilePathCalculator } from "../utils/artifact-saver";
import { isLayerArtifact, LayerArtifact } from "../engine/layer-artifact";
import { GeneratorStage, GenerationContext } from "../engine/generator-stage-interface";
import { PresentationLayerGenerator } from "./strategy-interface";

/**
 * Class which represents the presentation layer generation "stage".
 * Implements the `GeneratorStage` interface to provide stage generation method.
 */
export class PresentationLayerStage implements GeneratorStage {

    artifactSaver: ArtifactSaver;
    private readonly _presentationLayerStrategy: PresentationLayerGenerator;

    constructor(capabilityLabel: string, presentationLayerGenerator: PresentationLayerGenerator) {
        if (!capabilityLabel || capabilityLabel === "") {
            throw new Error("Unable to generate presentation layer for capability with empty / invalid name.");
        }

        this.artifactSaver = new ArtifactSaver(`/presentation-layer/${capabilityLabel}`);
        this._presentationLayerStrategy = presentationLayerGenerator;
    }

    /**
     * Method responsible for management of the presentation layer stage generation process.
     *
     * @param context - The generation context.
     * @returns A promise that resolves to a `LayerArtifact` instance which contains data about the main generated artifact of this layer.
     * @throws Will throw an error if the data layer could not be generated.
     */
    async generateStage(context: GenerationContext): Promise<LayerArtifact> {
        context._.pathResolver = this.artifactSaver as GeneratedFilePathCalculator;

        const presentationLayerArtifact = await this._presentationLayerStrategy.generatePresentationLayer(context);

        if (!isLayerArtifact(presentationLayerArtifact)) {
            throw new Error("Could not generate presentation layer");
        }

        return presentationLayerArtifact;
    }
}