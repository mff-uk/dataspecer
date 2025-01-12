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

/**
 * Represents a stage in the generation process; typically, a stage corresponds to a separate layer of the generated application.
 */
export interface GeneratorStage {
    /**
     * An instance of `ArtifactSaver` used to save generated artifacts.
     */
    artifactSaver?: ArtifactSaver;
    generateStage(context: GenerationContext): Promise<LayerArtifact>;
}