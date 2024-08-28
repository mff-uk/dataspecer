import { LayerArtifact } from "../engine/layer-artifact";
import { GenerationContext } from "../engine/generator-stage-interface";

export interface PresentationLayerGenerator {
    strategyIdentifier: string;
    generatePresentationLayer(context: GenerationContext): Promise<LayerArtifact>;
}