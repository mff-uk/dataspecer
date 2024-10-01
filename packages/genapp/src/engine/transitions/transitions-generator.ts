import {
    ApplicationGraph,
    ApplicationGraphEdgeType,
    ApplicationGraphNode
} from "../graph";
import {
    CapabilityIdentifier,
    CapabilityType,
    CREATE_CAPABILITY_ID,
    DELETE_CAPABILITY_ID,
    DETAIL_CAPABILITY_ID,
    getCapabilityMetadata,
    LIST_CAPABILITY_ID
} from "../../capabilities";
import { ListCapabilityMetadata } from "../../capabilities/list";
import { DetailCapabilityMetadata } from "../../capabilities/detail";
import { CreateInstanceCapabilityMetadata } from "../../capabilities/create-instance";
import { DeleteInstanceCapabilityMetadata } from "../../capabilities/delete-instance";

export type AllowedTransition = {
    label: string,
    id: string,
    targetId: string,
    capabilityType: "instance" | "collection",
    transitionType: ApplicationGraphEdgeType
}

type AllowedTransitionsMap = {
    [capabilityIri: string]: {
        label: string,
        aggregations: CapabilityIdentifier[],
        redirections: CapabilityIdentifier[],
        transitions: CapabilityIdentifier[]
    }
}

export class TransitionsGenerator {

    private readonly _allowedTransitionTypes: AllowedTransitionsMap = {
        [LIST_CAPABILITY_ID]: {
            label: ListCapabilityMetadata.label,
            aggregations: [],
            redirections: [],
            transitions: [
                CREATE_CAPABILITY_ID,
                DELETE_CAPABILITY_ID,
                DETAIL_CAPABILITY_ID,
                LIST_CAPABILITY_ID
            ]
        },
        [DETAIL_CAPABILITY_ID]: {
            label: DetailCapabilityMetadata.label,
            aggregations: [
                LIST_CAPABILITY_ID,
                CREATE_CAPABILITY_ID,
            ],
            redirections: [],
            transitions: [
                LIST_CAPABILITY_ID,
                DELETE_CAPABILITY_ID,
                CREATE_CAPABILITY_ID
            ]
        },
        [CREATE_CAPABILITY_ID]: {
            label: CreateInstanceCapabilityMetadata.label,
            aggregations: [],
            redirections: [
                LIST_CAPABILITY_ID,
                DETAIL_CAPABILITY_ID
            ],
            transitions: [],
        },
        [DELETE_CAPABILITY_ID]: {
            label: DeleteInstanceCapabilityMetadata.label,
            aggregations: [],
            redirections: [LIST_CAPABILITY_ID],
            transitions: [],
        }
    };

    private getAllowedTargetCapability(
        sourceCapabilityIri: string,
        targetCapabilityIri: string,
        edgeType: ApplicationGraphEdgeType
    ): CapabilityIdentifier | undefined {
        const sourceAllowed = this._allowedTransitionTypes[sourceCapabilityIri];

        if (!sourceAllowed) {
            throw new Error(`Invalid edge source capability iri: ${sourceCapabilityIri}`);
        }

        switch (edgeType) {
            case ApplicationGraphEdgeType.Transition:
                return sourceAllowed.transitions.find(iri => iri === targetCapabilityIri);
            case ApplicationGraphEdgeType.Redirection:
                return sourceAllowed.redirections.find(iri => iri === targetCapabilityIri);
            case ApplicationGraphEdgeType.Aggregation:
                return sourceAllowed.aggregations.find(iri => iri === targetCapabilityIri);
            default:
                throw new Error(`Invalid edge type. Please choose from available edge types."`);
        }
    }

    public async getNodeTransitions(currentNode: ApplicationGraphNode, graph: ApplicationGraph): Promise<NodeTransitionsView> {
        const edges = currentNode.getOutgoingEdges(graph);

        const transitionLinkPromises = edges.map(
            async edge => {
                const transitionEndNode: ApplicationGraphNode | null = graph.getNodeByIri(edge.target);

                if (!transitionEndNode) {
                    throw new Error(`Invalid transition edge: ${edge}`);
                }

                const dataStructurePromise = transitionEndNode.getNodeDataStructure();

                const sourceCapabilityIri = currentNode.getCapabilityInfo().iri;
                const targetCapabilityIri = transitionEndNode.getCapabilityInfo().iri;

                // TODO: compare currentNode -> transitionEndNode structure roots to know if they're equal
                // (this is to prevent e.g. from dataset list -> delete catalog)

                const allowedTargetIri = this.getAllowedTargetCapability(sourceCapabilityIri, targetCapabilityIri, edge.type);

                console.log(`NODE FROM ${currentNode.getIri()} to ${transitionEndNode.getIri()}`);

                if (!allowedTargetIri) {
                    console.error(`Could not find matching "${edge.type.toString()}" transition from ${sourceCapabilityIri} to ${targetCapabilityIri}`)
                    const toFilterTransition: AllowedTransition = {
                        id: "filter",
                        targetId: "",
                        capabilityType: "collection",
                        label: "",
                        transitionType: ApplicationGraphEdgeType.Transition
                    };

                    return toFilterTransition;
                }

                const targetCapability = getCapabilityMetadata(allowedTargetIri, transitionEndNode.getNodeLabel("en"));
                const targetDatastructure = await dataStructurePromise;

                const generatedTransition: AllowedTransition = {
                    id: `/${targetDatastructure.technicalLabel}/${targetCapability.getLabel()}`,
                    targetId: targetCapability.getLabel(),
                    label: targetCapability.getHumanLabel(),
                    capabilityType: targetCapability.getType(),
                    transitionType: edge.type
                };

                console.log("TRANSITION RESULT: ", generatedTransition);

                return generatedTransition;
            });

        const transitionLinks = (await Promise.all(transitionLinkPromises))
            .filter(link => link.id !== "filter");

        return new NodeTransitionsView(transitionLinks);
    }
}

export class NodeTransitionsView {

    private readonly _transitions: AllowedTransition[];

    constructor(allowedTransitions: AllowedTransition[]) {

        this._transitions = allowedTransitions;
    }

    any(capabilityType?: CapabilityType): boolean {
        if (!capabilityType) {
            return this._transitions.length > 0;
        }

        return this._transitions.filter(tr => tr.capabilityType === capabilityType).length > 0;
    }

    groupByTransitionType(): { [edgeType: string]: AllowedTransition[] } {

        return Object
            .values(ApplicationGraphEdgeType)
            .reduce<{ [edgeType: string]: AllowedTransition[] }>(
                (acc, edgeType) => {
                    acc[edgeType] = this._transitions.filter(tr => tr.transitionType === edgeType);
                    return acc
                },
                {}
            );
    }

    groupByCapabilityType(): { [capabilityType: string]: AllowedTransition[] } {
        return Object
            .values(CapabilityType)
            .reduce<{ [capabilityType: string]: AllowedTransition[] }>(
                (acc, capabilityType) => {
                    acc[capabilityType] = this._transitions.filter(tr => tr.capabilityType === capabilityType);
                    return acc;
                },
                {}
            );
    }
}