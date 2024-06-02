import { type AxiosResponse } from "axios";
import { LayerArtifact } from "../engine/layer-artifact";
import { StageGenerationContext } from "../engine/generator-stage-interface";

export function isAxiosResponse(
    dataLayerResult: LayerArtifact | AxiosResponse<LayerArtifact, any> | AxiosResponse<Buffer, any>
): dataLayerResult is AxiosResponse<LayerArtifact, any>
{
    return (dataLayerResult as AxiosResponse<LayerArtifact, any>).data !== undefined;
}

export function isLayerArtifact(obj: any): obj is LayerArtifact {
    const la = obj as LayerArtifact;
    return la !== undefined;
}

export interface DalGeneratorStrategy {
    strategyIdentifier: string;
    generateDataLayer(context: StageGenerationContext): Promise<LayerArtifact> | Promise<AxiosResponse<LayerArtifact, any>>;
}