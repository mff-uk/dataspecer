import { Iri } from "../../application-config";

export enum ApplicationGraphEdgeType {
    Transition,
    Aggregation,
    Redirection
}

export type ApplicationGraphEdge = {
    iri: Iri; // edge iri
    source: Iri; // outgoing node iri
    target: Iri; // incoming node iri
    type: ApplicationGraphEdgeType;
};
