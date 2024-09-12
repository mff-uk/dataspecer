import {
    ApplicationGraph,
    ApplicationGraphEdgeType,
    ApplicationGraphNode
} from "../graph";
import { CapabilityType } from "../../capabilities";
import { ListCapabilityMetadata } from "../../capabilities/list";
import { DetailCapabilityMetadata } from "../../capabilities/detail";
import { CreateInstanceCapabilityMetadata } from "../../capabilities/create-instance";
import { DeleteInstanceCapabilityMetadata } from "../../capabilities/delete-instance";

export type AllowedTransition = {
    label: string,
    id: string,
    capabilityType: "instance" | "collection",
    transitionType: ApplicationGraphEdgeType
}

type CapabilityMetadataType = ListCapabilityMetadata | DetailCapabilityMetadata | CreateInstanceCapabilityMetadata | DeleteInstanceCapabilityMetadata;

type AllowedTransitionsMap = {
    [capabilityIri: string]: {
        label: string,
        aggregations: CapabilityMetadataType[],
        redirections: CapabilityMetadataType[],
        transitions: CapabilityMetadataType[]
    }
}

export class TransitionsGenerator {

    private readonly listMetadata = new ListCapabilityMetadata();
    private readonly detailMetadata = new DetailCapabilityMetadata();
    private readonly createMetadata = new CreateInstanceCapabilityMetadata();
    private readonly deleteMetadata = new DeleteInstanceCapabilityMetadata();

    private readonly _allowedTransitionTypes: AllowedTransitionsMap = {
        [this.listMetadata.getIdentifier()]: {
            label: this.listMetadata.getLabel(),
            aggregations: [],
            redirections: [],
            transitions: [
                this.createMetadata,
                this.deleteMetadata,
                this.detailMetadata,
                this.listMetadata
            ]
        },
        [this.detailMetadata.getIdentifier()]: {
            label: this.detailMetadata.getLabel(),
            aggregations: [],
            redirections: [],
            transitions: [
                this.listMetadata,
                this.deleteMetadata
            ]
        },
        [this.createMetadata.getIdentifier()]: {
            label: this.createMetadata.getLabel(),
            aggregations: [],
            transitions: [],
            redirections: [
                this.listMetadata,
                this.detailMetadata
            ]
        },
        [this.deleteMetadata.getIdentifier()]: {
            label: this.deleteMetadata.getLabel(),
            aggregations: [],
            transitions: [],
            redirections: [this.listMetadata],
        }
    };

    private getAllowedTargetCapability(
        sourceCapabilityIri: string,
        targetCapabilityIri: string,
        edgeType: ApplicationGraphEdgeType
    ): CapabilityMetadataType | undefined {
        const sourceAllowed = this._allowedTransitionTypes[sourceCapabilityIri];

        if (!sourceAllowed) {
            throw new Error(`Invalid edge source capability iri: ${sourceCapabilityIri}`);
        }

        switch (edgeType) {
            case ApplicationGraphEdgeType.Transition:
                return sourceAllowed.transitions.find(x => x.getIdentifier() === targetCapabilityIri);
            case ApplicationGraphEdgeType.Redirection:
                return sourceAllowed.redirections.find(x => x.getIdentifier() === targetCapabilityIri);
            case ApplicationGraphEdgeType.Aggregation:
                return sourceAllowed.aggregations.find(x => x.getIdentifier() === targetCapabilityIri);
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

                const targetCapability = this.getAllowedTargetCapability(sourceCapabilityIri, targetCapabilityIri, edge.type);

                console.log(`NODE FROM ${currentNode.getIri()} to ${transitionEndNode.getIri()}`);


                if (!targetCapability) {
                    console.error(`Could not find matching "${edge.type.toString()}" transition from ${sourceCapabilityIri} to ${targetCapabilityIri}`)
                }

                const targetDatastructure = await dataStructurePromise;

                const capabilityLabel = targetCapability!.getLabel();

                const result: AllowedTransition = {
                    id: `/${targetDatastructure.technicalLabel}/${capabilityLabel}`,
                    label: targetCapability!.getHumanLabel(),
                    capabilityType: targetCapability!.getType(),
                    transitionType: edge.type
                };

                console.log("TRANSITION RESULT: ", result);

                return result;
            });

        const transitionLinks = await Promise.all(transitionLinkPromises);

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