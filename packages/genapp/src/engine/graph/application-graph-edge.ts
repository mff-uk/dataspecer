import { Iri } from "../../application-config";

export enum ApplicationGraphEdgeType {
    Transition = "transition",
    Aggregation = "aggregation",
    Redirection = "redirect"
}

export type ApplicationGraphEdge = {
    iri: Iri; // edge iri
    source: Iri; // outgoing node iri
    target: Iri; // incoming node iri
    type: ApplicationGraphEdgeType;
};
