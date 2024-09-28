export enum ApplicationGraphEdgeType {
    Transition = "transition",
    Aggregation = "aggregation",
    Redirection = "redirect"
}

export type ApplicationGraphEdge = {
    iri: string; // edge iri
    source: string; // outgoing node iri
    target: string; // incoming node iri
    type: ApplicationGraphEdgeType;
};
