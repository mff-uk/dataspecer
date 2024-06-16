import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateDependencyMap } from "../../templates/template-consumer";

export interface ApplicationLayerTemplateDependencyMap extends TemplateDependencyMap {
    dataLayerLinkArtifact: LayerArtifact
}