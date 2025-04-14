import { LayerArtifact } from "../engine/layer-artifact.ts";
import { GenerationContext } from "../engine/generator-stage-interface.ts";

export interface ApplicationLayerGenerator {
    strategyIdentifier: string;
    generateApplicationLayer(context: GenerationContext): Promise<LayerArtifact>;
}