import { type AxiosResponse } from "axios";
import { LayerArtifact } from "../engine/layer-artifact";
import { StageGenerationContext } from "../engine/generator-stage-interface";

export interface DalGeneratorStrategy {
    strategyIdentifier: string;
    generateDataLayer(context: StageGenerationContext): Promise<LayerArtifact> | Promise<AxiosResponse<LayerArtifact, any>>;
}