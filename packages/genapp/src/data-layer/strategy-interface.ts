import { type AxiosResponse } from "axios";
import { LayerArtifact } from "../engine/layer-artifact";
import { GenerationContext } from "../engine/generator-stage-interface";

export interface DalGeneratorStrategy {
    strategyIdentifier: string;
    generateDataLayer(context: GenerationContext): Promise<LayerArtifact> | Promise<AxiosResponse<LayerArtifact, any>>;
}