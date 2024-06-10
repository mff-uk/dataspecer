import { LayerArtifact } from "../engine/layer-artifact";
import { StageGenerationContext } from "../engine/generator-stage-interface";

export interface PresentationLayerGeneratorStrategy {
    strategyIdentifier: string;
    generatePresentationLayer(context: StageGenerationContext): Promise<LayerArtifact>;
}