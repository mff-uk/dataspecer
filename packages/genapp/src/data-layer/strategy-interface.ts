import { type AxiosResponse } from "axios";
import { LayerArtifact } from "../engine/layer-artifact";
import { GenerationContext } from "../engine/generator-stage-interface";

/**
 * Interface for generating the data access layer of an application.
 * This interface defines the contract for generating the source code for the data layer of the generated application.
 */
export interface DalGeneratorStrategy {
    /**
     * A unique identifier for the strategy.
     */
    strategyIdentifier: string;

    /**
     * Generates the data access layer based on the provided context.
     *
     * @param context - The context used for data access layer generation.
     * @returns A promise that resolves to a LayerArtifact instance containing the code of the data access layer,
     *          or an AxiosResponse containing a LayerArtifact instance.
     */
    generateDataLayer(context: GenerationContext): Promise<LayerArtifact> | Promise<AxiosResponse<LayerArtifact, any>>;
}