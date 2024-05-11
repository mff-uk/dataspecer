import { type AxiosResponse } from "axios";
import { LayerArtifact } from "../engine/layer-artifact";
import { StageGenerationContext } from "../engine/generator-stage-interface";

export function isLayerArtifact(
    dataLayerResult: LayerArtifact | AxiosResponse<LayerArtifact, any>
): dataLayerResult is AxiosResponse<LayerArtifact, any>
{
    return (dataLayerResult as AxiosResponse<LayerArtifact, any>).data !== undefined;
}

export interface DalGeneratorStrategy {
    strategyIdentifier: string;
    generateDataLayer(context: StageGenerationContext): Promise<LayerArtifact> | Promise<AxiosResponse<LayerArtifact, any>>;
}