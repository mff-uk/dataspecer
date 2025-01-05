import { LayerArtifact } from "../engine/layer-artifact";
import { GenerationContext } from "../engine/generator-stage-interface";

/**
 * Interface for an application layer generator.
 */
export interface ApplicationLayerGenerator {

    strategyIdentifier: string;

    /**
     * Method responsible for the generation of the application layer based on the provided context.
     *
     * @param context - The context used for application layer generation.
     * @returns A promise to return a LayerArtifact instance.
     */
    generateApplicationLayer(context: GenerationContext): Promise<LayerArtifact>;
}