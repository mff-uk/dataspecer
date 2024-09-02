import {
    ApplicationGraph,
    ApplicationGraphEdgeType,
    ApplicationGraphNode
} from "../graph";
import {
    CreateInstanceCapability,
    DeleteInstanceCapability,
    DetailCapability,
    ListCapability
} from "../../capabilities";

export type AllowedTransition = {
    label: string,
    id: string
}

type AllowedTransitionsMap = {
    [capabilityIri: string]: {
        label: string,
        aggregations: AllowedTransition[],
        redirections: AllowedTransition[],
        transitions: AllowedTransition[]
    }
}

export class TransitionsGenerator {

    private readonly _allowedTransitions: AllowedTransitionsMap = {
        [ListCapability.identifier]: {
            label: ListCapability.label,
            aggregations: [],
            redirections: [],
            transitions: [
                { id: CreateInstanceCapability.identifier, label: CreateInstanceCapability.label },
                { id: DeleteInstanceCapability.identifier, label: DeleteInstanceCapability.label },
                { id: DetailCapability.identifier, label: DetailCapability.label }
            ]
        },
        [DetailCapability.identifier]: {
            label: DetailCapability.label,
            aggregations: [],
            redirections: [],
            transitions: [
                { id: ListCapability.identifier, label: ListCapability.label },
                { id: DeleteInstanceCapability.identifier, label: DeleteInstanceCapability.label }
            ]
        },
        [CreateInstanceCapability.identifier]: {
            label: CreateInstanceCapability.label,
            aggregations: [],
            transitions: [],
            redirections: [
                { id: ListCapability.identifier, label: ListCapability.label },
                { id: DetailCapability.identifier, label: DetailCapability.label }
            ]
        },
        [DeleteInstanceCapability.identifier]: {
            label: DeleteInstanceCapability.label,
            aggregations: [],
            transitions: [],
            redirections: [
                { id: ListCapability.identifier, label: ListCapability.label }
            ],
        }
    };

    private chooseTargetLabelFromAllowedTransitions(
        sourceCapabilityIri: string,
        targetCapabilityIri: string,
        edgeType: ApplicationGraphEdgeType
    ) {
        const sourceAllowed = this._allowedTransitions[sourceCapabilityIri];

        if (!sourceAllowed) {
            throw new Error(`Invalid edge source capability iri: ${sourceCapabilityIri}`);
        }

        switch (edgeType) {
            case ApplicationGraphEdgeType.Transition:
                return sourceAllowed.transitions.find(x => x.id === targetCapabilityIri)?.label ?? "";
            case ApplicationGraphEdgeType.Redirection:
                return sourceAllowed.redirections.find(x => x.id === targetCapabilityIri)?.label ?? "";
            case ApplicationGraphEdgeType.Aggregation:
                return sourceAllowed.aggregations.find(x => x.id === targetCapabilityIri)?.label ?? "";
            default:
                throw new Error("Invalid edge type");
        }
    }

    public async getNodeTransitions(currentNode: ApplicationGraphNode, graph: ApplicationGraph): Promise<AllowedTransition[]> {
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

                const targetLabel = this.chooseTargetLabelFromAllowedTransitions(sourceCapabilityIri, targetCapabilityIri, edge.type);

                if (targetLabel === "") {
                    console.error(`Unsupported "${edge.type.toString()}" transition from ${sourceCapabilityIri} to ${targetCapabilityIri}`)
                }

                const targetDatastructure = await dataStructurePromise;

                const capabilityLabel = targetLabel.length === 1
                    ? targetLabel.toUpperCase()
                    : `${targetLabel[0]?.toUpperCase()}${targetLabel.slice(1)}`;

                return {
                    id: `/${targetDatastructure.technicalLabel}/${targetLabel}`,
                    label: capabilityLabel
                } as AllowedTransition;
            });

        const transitionLinks = await Promise.all(transitionLinkPromises);

        return transitionLinks
            .filter(link => !link.id.endsWith("/")); // filters out empty capability labels
    }
}