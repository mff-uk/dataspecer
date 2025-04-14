import { EDIT_CAPABILITY_ID } from "../src/capabilities/index.ts";
import { ApplicationGraphEdgeType } from "../src/engine/graph/index.ts";
import { ApplicationGraphType } from "../src/engine/graph/application-graph.ts";
import { EDGE_IRI_BASE, NODE_IRI_BASE } from "./constants.ts";

export const emptyAppGraph: ApplicationGraphType = {
    label: "Empty graph",
    dataSpecification: "<a specification IRI>",
    datasources: [],
    nodes: [],
    edges: []
}

export const simpleNodeGraph: ApplicationGraphType = {
    label: "A graph",
    dataSpecification: "<a specification IRI>",
    datasources: [],
    nodes: [
        {
            label: {
                cs: ""
            },
            iri: `${NODE_IRI_BASE}/1`,
            capability: "",
            config: {},
            structure: ""
        }
    ],
    edges: []
}

export const simpleEdgeGraph: ApplicationGraphType = {
    label: "A simple-edge graph",
    dataSpecification: "<a specification IRI>",
    datasources: [],
    nodes: [
        {
            label: {},
            iri: `${NODE_IRI_BASE}/1`,
            capability: "",
            config: {},
            structure: ""
        },
        {
            label: {},
            iri: `${NODE_IRI_BASE}/2`,
            capability: "",
            config: {},
            structure: ""
        }
    ],
    edges: [
        {
            iri: `${EDGE_IRI_BASE}/1`,
            source: `${NODE_IRI_BASE}/1`,
            target: `${NODE_IRI_BASE}/2`,
            type: ApplicationGraphEdgeType.Transition
        }
    ]
}

export const editCapabilityGraphWithNoDetailNode: ApplicationGraphType = {
    datasources: [],
    dataSpecification: "",
    edges: [],
    label: "",
    nodes: [
        {
            "iri": `${NODE_IRI_BASE}/1`,
            capability: EDIT_CAPABILITY_ID,
            label: {},
            structure: `${NODE_IRI_BASE}/1`,
            config: {}
        }
    ]
}