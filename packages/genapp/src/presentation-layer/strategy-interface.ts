import { LayerArtifact } from "../engine/layer-artifact.ts";
import { GenerationContext } from "../engine/generator-stage-interface.ts";

export interface PresentationLayerGenerator {
    strategyIdentifier: string;
    generatePresentationLayer(context: GenerationContext): Promise<LayerArtifact>;
}