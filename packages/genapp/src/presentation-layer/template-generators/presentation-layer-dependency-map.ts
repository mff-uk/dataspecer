import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateDependencyMap } from "../../templates/template-consumer";

export interface PresentationLayerDependencyMap extends TemplateDependencyMap {
    listAppLogicArtifact: LayerArtifact;
}