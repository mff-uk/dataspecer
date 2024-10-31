import { LayerArtifact } from "../engine/layer-artifact";
import { GenerationContext } from "../engine/generator-stage-interface";

export interface ApplicationLayerGenerator {
    strategyIdentifier: string;
    generateApplicationLayer(context: GenerationContext): Promise<LayerArtifact>;
}