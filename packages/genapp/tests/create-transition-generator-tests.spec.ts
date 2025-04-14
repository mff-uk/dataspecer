import { AllowedTransition, TransitionsGenerator } from "../src/engine/transitions/transitions-generator.ts"
import { CapabilityType, CREATE_CAPABILITY_ID, DETAIL_CAPABILITY_ID, LIST_CAPABILITY_ID } from "../src/capabilities/index.ts";
import { ApplicationGraph } from "../src/engine/graph/application-graph.ts";
import { EDGE_IRI_BASE, NODE_IRI_BASE, STRUCTURE_IRI_BASE } from "./constants.ts";
import { ApplicationGraphEdgeType, ApplicationGraphNode, ApplicationGraphNodeType } from "../src/engine/graph/index.ts";
import { AggregateMetadata } from "../src/application-config.ts";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { vi } from 'vitest'

function mockGetStructureModelInfoMethod(instance: ApplicationGraphNode, dataPsm: DataPsmSchema) {
    return vi.spyOn(instance!, "getNodeStructureModel")
        .mockReturnValue(Promise.resolve(
            new AggregateMetadata(
                "",
                dataPsm
            )
        ));
}

const getCreateSourceNode = () => {
    const listNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/1`,
        capability: CREATE_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/1234`,
        config: {}
    };

    return listNode;
}

test("test create -> list redirect", async () => {

    const createNode = getCreateSourceNode();
    const listNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: LIST_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const graph: ApplicationGraph =  new ApplicationGraph({
        label: "A graph to test create redirects",
        dataSpecification: "",
        datasources: [],
        nodes: [createNode, listNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: createNode.iri,
                target: listNode.iri,
                type: ApplicationGraphEdgeType.Redirection
            }
        ]
    });

    const listNodeInstance = graph.getNodeByIri(listNode.iri);
    const listNodePsmSchema: DataPsmSchema = {
        iri: listNode.iri,
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {
            "en": "Data Structure Model"
        },
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: null,
        types: []
    }

    mockGetStructureModelInfoMethod(listNodeInstance!, listNodePsmSchema);

    expect((await graph.getNodeByIri(listNode.iri)!.getNodeStructureModel()).aggregateName).toBe("data-structure-model");

    const createRedirectView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                "",
                createNode
            ),
            graph
        );

    expect(createRedirectView.any(CapabilityType.Collection)).toBe(true);
    const transitionDetail: AllowedTransition = createRedirectView
        .groupByCapabilityType()[CapabilityType.Collection.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("list");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Redirection);
    expect(transitionDetail.id).toBe("/data-structure-model/list");
});

test("test create -> detail redirect ", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const createNode: ApplicationGraphNodeType = getCreateSourceNode();

    const detailNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: DETAIL_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const graph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test create redirects",
        dataSpecification: specificationIri,
        datasources: [],
        nodes: [createNode, detailNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: createNode.iri,
                target: detailNode.iri,
                type: ApplicationGraphEdgeType.Redirection
            }
        ]
    });

    const detailNodeInstance = graph.getNodeByIri(detailNode.iri);
    const detailPsmSchema: DataPsmSchema = {
        iri: detailNode.iri,
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {
            "en": "Data Structure Model"
        },
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: null,
        types: []
    }


    mockGetStructureModelInfoMethod(detailNodeInstance!, detailPsmSchema);

    expect((await graph.getNodeByIri(detailNode.iri)!.getNodeStructureModel()).aggregateName).toBe("data-structure-model");

    const createRedirectView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                createNode
            ),
            graph
        );

    expect(createRedirectView.any(CapabilityType.Instance)).toBe(true);
    const transitionDetail: AllowedTransition = createRedirectView
        .groupByCapabilityType()[CapabilityType.Instance.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("detail");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Redirection);
    expect(transitionDetail.id).toBe("/data-structure-model/detail");
});

test("test create -> not supported transition type / target will not generate anything", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const listNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: LIST_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/1234`,
        config: {}
    };

    const createNode: ApplicationGraphNodeType = getCreateSourceNode();

    const graph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test list transitions",
        dataSpecification: specificationIri,
        datasources: [],
        nodes: [listNode, createNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: createNode.iri,
                target: listNode.iri,
                type: ApplicationGraphEdgeType.Transition
            }
        ]
    });

    const createNodeInstance = graph.getNodeByIri(createNode.iri);
    const createNodePsmSchema: DataPsmSchema = {
        iri: createNode.iri,
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {
            "en": "Data Structure Model"
        },
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: null,
        types: []
    }

    mockGetStructureModelInfoMethod(createNodeInstance!, createNodePsmSchema);

    const createTransitionsView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                listNode
            ),
            graph
        );

    expect(createTransitionsView.any()).toBe(false);
});
