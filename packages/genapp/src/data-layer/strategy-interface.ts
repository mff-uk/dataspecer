import { type AxiosResponse } from "axios";
import { LayerArtifact } from "../engine/layer-artifact";
import { GenerationContext } from "../engine/generator-stage-interface";

export interface DalGeneratorStrategy {
    strategyIdentifier: string;

    /**
     * Method responsible for the generation of the data access layer based on the provided context.
     *
     * @param context - The context used for data access layer generation.
     * @returns A promise to return a LayerArtifact instance.
     */
    generateDataLayer(context: GenerationContext): Promise<LayerArtifact> | Promise<AxiosResponse<LayerArtifact, any>>;
}