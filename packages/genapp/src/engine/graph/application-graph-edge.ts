export enum ApplicationGraphEdgeType {
    /**
     * A transition to target capability is performed after a user's action. Typically a click on a button.
     */
    Transition = "transition",

    /**
     * Embedding of target capability into a source capability.
     * NOTE: Not supported in current version.
     */
    Aggregation = "aggregation",

    /**
     * Automatic transition to target capability after a certain condition is met (e.g. operation finished successfully).
     */
    Redirection = "redirect"
}

/**
 * Describes an application graph edge. Each instance of application graph edge
 * represents a way of interaction - transition - within the generated application.
 * The goal of application graph edges is to provide the user a way to define and capture
 * interactions between different capabilities.
 */
export type ApplicationGraphEdge = {
    /**
     * @property iri: Unique identifier of an application edge.
     * @example "https://example.org/application_graph/edges/1"
     */
    iri: string;

    /**
     * Identifier - IRI of the source node - (capability, aggregate) pair, from which the user wants to leave.
     * References a graph's node IRI. (@type ApplicationGraphNode)
     */
    source: string;

    /**
     * Identifier - IRI of the target node - (capability, aggregate) pair, to which the user wants to arrive.
     * References a graph's node IRI. (@type ApplicationGraphNode)
     */
    target: string; // incoming node iri

    /**
     * Enumeration of supported edge types.
     */
    type: ApplicationGraphEdgeType;
};
