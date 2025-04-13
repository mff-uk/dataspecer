import { AllowedTransition, TransitionsGenerator } from "../src/engine/transitions/transitions-generator"
import { CapabilityType, CREATE_CAPABILITY_ID, DELETE_CAPABILITY_ID, DETAIL_CAPABILITY_ID, EDIT_CAPABILITY_ID, LIST_CAPABILITY_ID } from "../src/capabilities";
import { ApplicationGraph } from "../src/engine/graph/application-graph";
import { EDGE_IRI_BASE, NODE_IRI_BASE, STRUCTURE_IRI_BASE } from "./constants";
import { ApplicationGraphEdgeType, ApplicationGraphNode, ApplicationGraphNodeType } from "../src/engine/graph";
import { AggregateMetadata } from "../src/application-config";
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

const getListSourceNode = () => {
    const listNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/1`,
        capability: LIST_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/1234`,
        config: {}
    };

    return listNode;
}

const getCompletedSampleGraphWith = (targetNode: ApplicationGraphNodeType) => {
    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const listNode: ApplicationGraphNodeType = getListSourceNode();

    const listTransitionsGraph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test list transitions",
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

    return listTransitionsGraph;
}

test("test list -> detail transition", async () => {

    const listNode = getListSourceNode();
    const detailNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: DETAIL_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const listTransitionsGraph: ApplicationGraph = getCompletedSampleGraphWith(detailNode);

    const detailNodeInstance = listTransitionsGraph.getNodeByIri(detailNode.iri);
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

    expect((await listTransitionsGraph.getNodeByIri(detailNode.iri)!.getNodeStructureModel()).aggregateName).toBe("data-structure-model");

    const listTransitionView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                "",
                listNode
            ),
            listTransitionsGraph
        );

    expect(listTransitionView.any(CapabilityType.Instance)).toBe(true);
    const transitionDetail: AllowedTransition = listTransitionView
        .groupByCapabilityType()[CapabilityType.Instance.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("detail");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Transition);
    expect(transitionDetail.id).toBe("/data-structure-model/detail");
});

test("test list -> create transition", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const listNode: ApplicationGraphNodeType = getListSourceNode();

    const createNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: CREATE_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const listTransitionsGraph: ApplicationGraph = getCompletedSampleGraphWith(createNode);

    {
        const createNodeInstance = listTransitionsGraph.getNodeByIri(createNode.iri);
        const createPsmSchema: DataPsmSchema = {
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

        mockGetStructureModelInfoMethod(createNodeInstance!, createPsmSchema);
    }

    const listTransitionView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                listNode
            ),
            listTransitionsGraph
        );

    expect(listTransitionView.any(CapabilityType.Instance)).toBe(false);
    expect(listTransitionView.any(CapabilityType.Collection)).toBe(true);
    const transitionDetail: AllowedTransition = listTransitionView
        .groupByCapabilityType()[CapabilityType.Collection.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("create-instance");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Transition);
    expect(transitionDetail.id).toBe("/data-structure-model/create-instance");
});

test("test list -> edit transition", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const listNode: ApplicationGraphNodeType = getListSourceNode();

    const editNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: EDIT_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const listTransitionsGraph: ApplicationGraph = getCompletedSampleGraphWith(editNode);

    {
        const editNodeInstance = listTransitionsGraph.getNodeByIri(editNode.iri);
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

    const listTransitionView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                listNode
            ),
            listTransitionsGraph
        );

    expect(listTransitionView.any(CapabilityType.Collection)).toBe(false);
    expect(listTransitionView.any(CapabilityType.Instance)).toBe(true);
    const transitionDetail: AllowedTransition = listTransitionView
        .groupByCapabilityType()[CapabilityType.Instance.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("edit-instance");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Transition);
    expect(transitionDetail.id).toBe("/data-structure-model/edit-instance");
});

test("test list -> delete transition", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const listNode: ApplicationGraphNodeType = getListSourceNode();

    const deleteNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: DELETE_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const listTransitionsGraph: ApplicationGraph = getCompletedSampleGraphWith(deleteNode);

    {
        const deleteNodeInstance = listTransitionsGraph.getNodeByIri(deleteNode.iri);
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

    const listTransitionView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                listNode
            ),
            listTransitionsGraph
        );

    expect(listTransitionView.any(CapabilityType.Collection)).toBe(false);
    expect(listTransitionView.any(CapabilityType.Instance)).toBe(true);
    const transitionDetail: AllowedTransition = listTransitionView
        .groupByCapabilityType()[CapabilityType.Instance.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("delete-instance");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Transition);
    expect(transitionDetail.id).toBe("/data-structure-model/delete-instance");
});

test("test list -> detail redirect will not generate any", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const listNode: ApplicationGraphNodeType = getListSourceNode();

    const detailNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: DETAIL_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const listTransitionsGraph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test list redirect",
        dataSpecification: specificationIri,
        datasources: [],
        nodes: [listNode, detailNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: listNode.iri,
                target: detailNode.iri,
                type: ApplicationGraphEdgeType.Redirection
            }
        ]
    });

    const detailNodeInstance = listTransitionsGraph.getNodeByIri(detailNode.iri);
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

    const listTransitionView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                listNode
            ),
            listTransitionsGraph
        );

    expect(listTransitionView.any()).toBe(false);
});

test("test list -> invalid capability transition will not generate any transition", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const listNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/1`,
        capability: LIST_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/1234`,
        config: {}
    };

    const createNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: `http://example.com/invalid/capability/iri`,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const listTransitionsGraph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test list transitions",
        dataSpecification: specificationIri,
        datasources: [],
        nodes: [listNode, createNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: listNode.iri,
                target: createNode.iri,
                type: ApplicationGraphEdgeType.Transition
            }
        ]
    });

    const anyNodeInstance = listTransitionsGraph.getNodeByIri(createNode.iri);
    const anyPsmSchema: DataPsmSchema = {
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

    mockGetStructureModelInfoMethod(anyNodeInstance!, anyPsmSchema);

    const listTransitionView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                listNode
            ),
            listTransitionsGraph
        );

    expect(listTransitionView.any()).toBe(false);
});
