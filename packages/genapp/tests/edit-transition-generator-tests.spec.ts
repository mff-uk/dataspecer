import { AllowedTransition, TransitionsGenerator } from "../src/engine/transitions/transitions-generator"
import { CapabilityType, DELETE_CAPABILITY_ID, DETAIL_CAPABILITY_ID, EDIT_CAPABILITY_ID, LIST_CAPABILITY_ID } from "../src/capabilities";
import { ApplicationGraph } from "../src/engine/graph/application-graph";
import { EDGE_IRI_BASE, NODE_IRI_BASE, STRUCTURE_IRI_BASE } from "./constants";
import { ApplicationGraphEdgeType, ApplicationGraphNode, ApplicationGraphNodeType } from "../src/engine/graph";
import { AggregateMetadata } from "../src/application-config";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";

function mockGetStructureModelInfoMethod(instance: ApplicationGraphNode, dataPsm: DataPsmSchema) {
    return jest.spyOn(instance!, "getNodeStructureModel")
        .mockReturnValue(Promise.resolve(
            new AggregateMetadata(
                "",
                dataPsm
            )
        ));
}

const getEditSourceNode = () => {
    const listNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/1`,
        capability: EDIT_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/1234`,
        config: {}
    };

    return listNode;
}

test("test edit -> list redirect", async () => {

    const editNode = getEditSourceNode();
    const listNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: LIST_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const graph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test edit redirects",
        dataSpecification: "",
        datasources: [],
        nodes: [editNode, listNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: editNode.iri,
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

    const editRedirectView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                "",
                editNode
            ),
            graph
        );

    expect(editRedirectView.any(CapabilityType.Collection)).toBe(true);
    const transitionDetail: AllowedTransition = editRedirectView
        .groupByCapabilityType()[CapabilityType.Collection.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("list");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Redirection);
    expect(transitionDetail.id).toBe("/data-structure-model/list");
});

test("test edit -> detail redirect ", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const editNode: ApplicationGraphNodeType = getEditSourceNode();

    const detailNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: DETAIL_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const graph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test edit redirects",
        dataSpecification: specificationIri,
        datasources: [],
        nodes: [editNode, detailNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: editNode.iri,
                target: detailNode.iri,
                type: ApplicationGraphEdgeType.Redirection
            }
        ]
    });

    {
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
    }

    const editRedirectView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                editNode
            ),
            graph
        );

    expect(editRedirectView.any(CapabilityType.Instance)).toBe(true);
    const transitionDetail: AllowedTransition = editRedirectView
        .groupByCapabilityType()[CapabilityType.Instance.toString()]
        .at(0)!;

    expect(transitionDetail.targetId).toBe("detail");
    expect(transitionDetail.transitionType).toBe(ApplicationGraphEdgeType.Redirection);
    expect(transitionDetail.id).toBe("/data-structure-model/detail");
});

test("test edit -> not supported transition type / target will not generate anything", async () => {

    // graph definition
    const specificationIri: string = "<a specification IRI>";
    const deleteNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: DELETE_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/1234`,
        config: {}
    };

    const editNode: ApplicationGraphNodeType = getEditSourceNode();

    const graph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test list transitions",
        dataSpecification: specificationIri,
        datasources: [],
        nodes: [deleteNode, editNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: editNode.iri,
                target: deleteNode.iri,
                type: ApplicationGraphEdgeType.Redirection
            }
        ]
    });

    const deleteNodeInstance = graph.getNodeByIri(editNode.iri);
    const deleteNodePsmSchema: DataPsmSchema = {
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

    mockGetStructureModelInfoMethod(deleteNodeInstance!, deleteNodePsmSchema);

    const editTransitionsView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                specificationIri,
                deleteNode
            ),
            graph
        );

    expect(editTransitionsView.any()).toBe(false);
});
