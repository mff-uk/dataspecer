import { LayerArtifact } from "./layer-artifact";
import { AggregateMetadata } from "../application-config";
import { ApplicationGraph, ApplicationGraphNode, NodeConfiguration } from "../engine/graph";
import { ArtifactSaver } from "../utils/artifact-saver";

/**
 * Represents the context in which a generation process occurs.
 */
export type GenerationContext = {
    aggregate: AggregateMetadata,
    config: NodeConfiguration;
    graph: ApplicationGraph,
    currentNode: ApplicationGraphNode,
    previousResult?: LayerArtifact;
    _: Record<string, any>;
};

export interface GeneratorStage {
    artifactSaver?: ArtifactSaver;
    generateStage(context: GenerationContext): Promise<LayerArtifact>;
}