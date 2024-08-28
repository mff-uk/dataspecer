import { ApplicationGraph, ApplicationGraphNode } from "../../application-config";
import { LayerArtifact } from "../../engine/layer-artifact";
import { TemplateDependencyMap } from "../../templates/template-consumer";
import { GeneratedFilePathCalculator } from "../../utils/artifact-saver";

export interface PresentationLayerDependencyMap extends TemplateDependencyMap {
    // TODO: Change to human label aggregate name identifier (without spaces pascal camel case)
    aggregateHumanLabel: string,
    pathResolver: GeneratedFilePathCalculator,
    appLogicArtifact: LayerArtifact;
    graph: ApplicationGraph;
    currentNode: ApplicationGraphNode;
}