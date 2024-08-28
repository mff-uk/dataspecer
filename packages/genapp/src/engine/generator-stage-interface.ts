import { LayerArtifact } from "./layer-artifact";
import { ApplicationGraph, ApplicationGraphEdge, ApplicationGraphNode } from "../application-config";
import { ArtifactSaver } from "../utils/artifact-saver";

export interface CapabilityConfiguration {
    graph: ApplicationGraph;
    currentNode: ApplicationGraphNode; // TODO: to be removed
    config: object;
}

export type StageGenerationContext = { 
    aggregateName: string;
    config: object;
    graph: ApplicationGraph,
    currentNode: ApplicationGraphNode, // TODO: to be removed
    previousResult?: LayerArtifact;
    _: Record<string, any>;
};

export interface GeneratorStage {
    artifactSaver?: ArtifactSaver;
    generateStage(context: StageGenerationContext): Promise<LayerArtifact>;
}