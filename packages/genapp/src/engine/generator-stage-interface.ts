import { LayerArtifact } from "./layer-artifact";
import { ApplicationGraph, ApplicationGraphEdge, ApplicationGraphNode } from "../application-config";
import { ArtifactSaver } from "../utils/artifact-saver";

export interface CapabilityConfiguration {
    graph: ApplicationGraph;
    node: ApplicationGraphNode; // TODO: to be removed
    config: object;
}

export type GenerationContext = { 
    technicalAggregateName: string,
    config: object;
    graph: ApplicationGraph,
    currentNode: ApplicationGraphNode, // TODO: to be removed
    previousResult?: LayerArtifact;
    _: Record<string, any>;
};

export interface GeneratorStage {
    artifactSaver?: ArtifactSaver;
    generateStage(context: GenerationContext): Promise<LayerArtifact>;
}