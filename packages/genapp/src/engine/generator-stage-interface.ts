import { LayerArtifact } from "./layer-artifact.ts";
import { AggregateMetadata } from "../application-config.ts";
import { ApplicationGraph, ApplicationGraphNode, NodeConfiguration } from "../engine/graph/index.ts";
import { ArtifactSaver } from "../utils/artifact-saver.ts";

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