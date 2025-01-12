import { LayerArtifact } from "../engine/layer-artifact";
import { GenerationContext } from "../engine/generator-stage-interface";

/**
 * Interface for generating the presentation layer of an application.
 * This interface defines the contract for generating UI components or presentation layer source code.
 */
export interface PresentationLayerGenerator {
    strategyIdentifier: string;

    /**
     * Method definition for the generation of the UI components / presentation layer source code based on the provided context.
     *
     * @param context - The context used for presentation layer generation.
     * @returns A promise to return a LayerArtifact instance which contains the code of the presentation layer.
     */
    generatePresentationLayer(context: GenerationContext): Promise<LayerArtifact>;
}