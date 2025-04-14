import { AllowedTransition, TransitionsGenerator } from "../src/engine/transitions/transitions-generator.ts"
import { CapabilityType, DELETE_CAPABILITY_ID, LIST_CAPABILITY_ID } from "../src/capabilities/index.ts";
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

test("test delete -> list redirect", async () => {

    const deleteNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/1`,
        capability: DELETE_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/1234`,
        config: {}
    };

    const listNode: ApplicationGraphNodeType = {
        label: {},
        iri: `${NODE_IRI_BASE}/2`,
        capability: LIST_CAPABILITY_ID,
        structure: `${STRUCTURE_IRI_BASE}/4321`,
        config: {}
    }

    const graph: ApplicationGraph = new ApplicationGraph({
        label: "A graph to test delete redirect",
        dataSpecification: "",
        datasources: [],
        nodes: [listNode, deleteNode],
        edges: [
            {
                iri: `${EDGE_IRI_BASE}/1`,
                source: deleteNode.iri,
                target: listNode.iri,
                type: ApplicationGraphEdgeType.Redirection
            }
        ]
    });

    {
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
    }

    const deleteRedirectView = await new TransitionsGenerator()
        .getNodeTransitions(
            new ApplicationGraphNode(
                "",
                deleteNode
            ),
            graph
        );

    expect(deleteRedirectView.any(CapabilityType.Collection)).toBe(true);
    const redirectDetail: AllowedTransition = deleteRedirectView
        .groupByCapabilityType()[CapabilityType.Collection.toString()]
        .at(0)!;

    expect(redirectDetail.targetId).toBe("list");
    expect(redirectDetail.transitionType).toBe(ApplicationGraphEdgeType.Redirection);
    expect(redirectDetail.id).toBe("/data-structure-model/list");
});

