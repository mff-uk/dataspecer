import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateDependencyMap } from "../../templates/template-consumer";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver";

export interface ApplicationLayerTemplateDependencyMap extends TemplateDependencyMap {
    pathResolver: GeneratedFilePathCalculator,
    dataLayerLinkArtifact: LayerArtifact
}