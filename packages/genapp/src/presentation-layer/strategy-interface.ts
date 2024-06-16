import { LayerArtifact } from "../engine/layer-artifact";
import { StageGenerationContext } from "../engine/generator-stage-interface";

export interface PresentationLayerGenerator {
    strategyIdentifier: string;
    generatePresentationLayer(context: StageGenerationContext): Promise<LayerArtifact>;
}