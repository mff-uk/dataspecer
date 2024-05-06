import { GeneratorStage } from "../engine/generator-stage-interface";
import { LayerArtifact } from "../engine/layer-artifact";

class PresentationLayerStage implements GeneratorStage {
    generateStage<X>(context: X): Promise<LayerArtifact> {
        throw new Error("Method not implemented.");
    }
}