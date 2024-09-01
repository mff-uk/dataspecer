import { LayerArtifact } from "./layer-artifact";
import { AggregateMetadata, ApplicationGraph, ApplicationGraphEdge, ApplicationGraphNode } from "../application-config";
import { ArtifactSaver } from "../utils/artifact-saver";

export interface CapabilityConfiguration {
    aggregate: AggregateMetadata,
    graph: ApplicationGraph;
    node: ApplicationGraphNode;
    config: object;
}

export type GenerationContext = { 
    aggregate: AggregateMetadata,
    config: object;
    graph: ApplicationGraph,
    currentNode: ApplicationGraphNode,
    previousResult?: LayerArtifact;
    _: Record<string, any>;
};

export interface GeneratorStage {
    artifactSaver?: ArtifactSaver;
    generateStage(context: GenerationContext): Promise<LayerArtifact>;
}