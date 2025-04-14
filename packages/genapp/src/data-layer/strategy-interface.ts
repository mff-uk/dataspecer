import { type AxiosResponse } from "axios";
import { LayerArtifact } from "../engine/layer-artifact.ts";
import { GenerationContext } from "../engine/generator-stage-interface.ts";

export interface DalGeneratorStrategy {
    strategyIdentifier: string;
    generateDataLayer(context: GenerationContext): Promise<LayerArtifact> | Promise<AxiosResponse<LayerArtifact, any>>;
}