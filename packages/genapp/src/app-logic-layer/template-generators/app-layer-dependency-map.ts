import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateDependencyMap } from "../../templates/template-consumer";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver";

export interface ApplicationLayerTemplateDependencyMap extends TemplateDependencyMap {
    aggregateHumanLabel: string,
    pathResolver: GeneratedFilePathCalculator,
    dataLayerLinkArtifact: LayerArtifact
}