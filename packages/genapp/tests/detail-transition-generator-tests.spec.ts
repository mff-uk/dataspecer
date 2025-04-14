import { AllowedTransition, TransitionsGenerator } from "../src/engine/transitions/transitions-generator.ts"
import { CapabilityType, CREATE_CAPABILITY_ID, DELETE_CAPABILITY_ID, DETAIL_CAPABILITY_ID, EDIT_CAPABILITY_ID, LIST_CAPABILITY_ID } from "../src/capabilities/index.ts";
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

const getDetailSourceNode = () => {
    const listNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/1`,
        capability: DETAIL_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/1234`,
        config: {}
    };

    return listNode;
}

const getCompletedSampleGraphWith = (targetNode: ApplicationGraphNodeType) => {
    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const listNode: ApplicationGraphNodeType = getDetailSourceNode();

    const graph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test detail transitions",
        dataSpecification: specificationIri,
        datasources: [],
        nodes: [listNode, targetNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: listNode.iri,
                target: targetNode.iri,
                type: ApplicationGraphEdgeType.Transition
            }
        ]
    });

    return graph;
}

test("test detail -> list transition", async () => {

    const detailNode = getDetailSourceNode();
    const listNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: LIST_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const graph: ApplicationGraph = getCompletedSampleGraphWith(listNode);

    {
        const listNodeInstance = graph.getNodeByIri(listNode.iri);
        const listPsmSchema: DataPsmSchema = {
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

        mockGetStructureModelInfoMethod(listNodeInstance!, listPsmSchema);
    }

    const detailTransitionView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                "",
                detailNode
            ),
            graph
        );

    expect(detailTransitionView.any(CapabilityType.Collection)).toBe(true);
    const transitionDetail: AllowedTransition = detailTransitionView
        .groupByCapabilityType()[CapabilityType.Collection.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("list");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Transition);
    expect(transitionDetail.id).toBe("/data-structure-model/list");
});

test("test detail -> edit transition", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const detailNode: ApplicationGraphNodeType = getDetailSourceNode();

    const editNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: EDIT_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const graph: ApplicationGraph = getCompletedSampleGraphWith(editNode);

    {
        const editNodeInstance = graph.getNodeByIri(editNode.iri);
        const editPsmSchema: DataPsmSchema = {
            iri: editNode.iri,
            dataPsmHumanDescription: {},
            dataPsmHumanLabel: {
                "en": "Data Structure Model"
            },
            dataPsmParts: [],
            dataPsmRoots: [],
            dataPsmTechnicalLabel: null,
            types: []
        }

        mockGetStructureModelInfoMethod(editNodeInstance!, editPsmSchema);
    }

    const detailTransitionView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                detailNode
            ),
            graph
        );

    expect(detailTransitionView.any(CapabilityType.Instance)).toBe(true);
    const transitionDetail: AllowedTransition = detailTransitionView
        .groupByCapabilityType()[CapabilityType.Instance.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("edit-instance");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Transition);
    expect(transitionDetail.id).toBe("/data-structure-model/edit-instance");
});

test("test detail -> delet transition", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const detailNode: ApplicationGraphNodeType = getDetailSourceNode();

    const deleteNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: DELETE_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const graph: ApplicationGraph = getCompletedSampleGraphWith(deleteNode);

    {
        const deleteNodeInstance = graph.getNodeByIri(deleteNode.iri);
        const deletePsmSchema: DataPsmSchema = {
            iri: deleteNode.iri,
            dataPsmHumanDescription: {},
            dataPsmHumanLabel: {
                "en": "Data Structure Model"
            },
            dataPsmParts: [],
            dataPsmRoots: [],
            dataPsmTechnicalLabel: null,
            types: []
        }

        mockGetStructureModelInfoMethod(deleteNodeInstance!, deletePsmSchema);
    }

    const detailTransitionView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                detailNode
            ),
            graph
        );

    expect(detailTransitionView.any(CapabilityType.Instance)).toBe(true);
    const transitionDetail: AllowedTransition = detailTransitionView
        .groupByCapabilityType()[CapabilityType.Instance.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("delete-instance");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Transition);
    expect(transitionDetail.id).toBe("/data-structure-model/delete-instance");
});

test("test detail -> any will not generate redirect transition", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const detailNode: ApplicationGraphNodeType = getDetailSourceNode();

    const deleteNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: DELETE_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const graph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test detail redirect",
        dataSpecification: specificationIri,
        datasources: [],
        nodes: [detailNode, deleteNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: detailNode.iri,
                target: deleteNode.iri,
                type: ApplicationGraphEdgeType.Redirection
            }
        ]
    });

    {
        const deleteNodeInstance = graph.getNodeByIri(deleteNode.iri);
        const deletePsmSchema: DataPsmSchema = {
            iri: deleteNode.iri,
            dataPsmHumanDescription: {},
            dataPsmHumanLabel: {
                "en": "Data Structure Model"
            },
            dataPsmParts: [],
            dataPsmRoots: [],
            dataPsmTechnicalLabel: null,
            types: []
        }

        mockGetStructureModelInfoMethod(deleteNodeInstance!, deletePsmSchema);
    }

    const detailRedirectView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                detailNode
            ),
            graph
        );

    expect(detailRedirectView.any()).toBe(false);
});

test("test detail -> invalid capability transition will not generate any transition", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const detailNode: ApplicationGraphNodeType = getDetailSourceNode();

    const invalidNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: `http://example.com/invalid/capability/iri`,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const graph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test invalid detail transition",
        dataSpecification: specificationIri,
        datasources: [],
        nodes: [detailNode, invalidNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: detailNode.iri,
                target: invalidNode.iri,
                type: ApplicationGraphEdgeType.Transition
            }
        ]
    });

    {
        const targetNodeInstance = graph.getNodeByIri(invalidNode.iri);
        const targetPsmSchema: DataPsmSchema = {
            iri: invalidNode.iri,
            dataPsmHumanDescription: {},
            dataPsmHumanLabel: {
                "en": "Data Structure Model"
            },
            dataPsmParts: [],
            dataPsmRoots: [],
            dataPsmTechnicalLabel: null,
            types: []
        }

        mockGetStructureModelInfoMethod(targetNodeInstance!, targetPsmSchema);
    }

    const detailTransitionView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                detailNode
            ),
            graph
        );

    expect(detailTransitionView.any()).toBe(false);
});
