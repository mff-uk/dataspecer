import { SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { VisualEntitiesWithOutsiders, XY } from "../..";
import { IGraphClassic } from "./graph";
import { isSemanticModelGeneralization, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { VISUAL_PROFILE_RELATIONSHIP_TYPE, VISUAL_RELATIONSHIP_TYPE, VisualModel, VisualProfileRelationship, VisualRelationship } from "@dataspecer/core-v2/visual-model";
import { AllowedEdgeBundleTypes, ExtractedModels, GeneralizationBundle, RelationshipBundle, RelationshipProfileBundle } from "../../layout-algorithms/layout-algorithm-interface";
import { addToRecordArray, capitalizeFirstLetter } from "../../util/utils";
import { INodeClassic, isNodeInVisualModel } from "./node";

export type AllowedEdgeTypes = SemanticModelGeneralization |
                        SemanticModelRelationship |
                        SemanticModelRelationshipProfile |
                        null;


// TODO: Can create more specific interfaces for generalization, etc, which will be extending this one - they will be different in the fields - edge: type and isProfile value
export interface IEdgeClassic {
    /**
     * The graph in which the edge lies, this is relevant for example for ELK layouting library,
     * where the edges have to be stored within the relevant wrapper graph.
     */
    sourceGraph: IGraphClassic;

    /**
     * Is the model of the semantic edge (that is {@link semanticEntityRepresentingEdge}) represented by this (interface).
     */
    sourceModelIdentifier: string | null;

    /**
     * Identifier of the edge, can be different from the edge id, for example when splitting ... TODO: Actually should I use the id of the semantic entity or of the visual one as origin??
     */
    id: string;                 // TODO: A lot of this data is same for class/edge/graph so it should be in separate interface/class
    /**
     * is the edge in the semantic model or null.
     */
    semanticEntityRepresentingEdge: AllowedEdgeTypes;
    /**
     * If true, then it is dummy edge which doesn't exist in the semantic model.
     */
    isDummy: boolean;
    /**
     * What type of edge this is in profile sense
     */
    edgeProfileType: EdgeProfileType;
    /**
     * If true then this edge is part of the layouted graph, therefore it should be considered, otherwise it is not considered in layouting.
     */
    isConsideredInLayout: boolean;

    layoutOptions: Record<string, string>;
    /**
     * If true then the direction of this edge is reversed in the layouting algorithm
     */
    reverseInLayout: boolean;

    /**
     * Represents the source from which the edge goes.
     */
    start: EdgeEndPoint;
    /**
     * Represents the target from which the edge goes.
     */
    end: EdgeEndPoint;

    visualEdge: VisualEdge;

    /**
     * Converts the edge into visual entity which can be used in the visual model.
     */
    convertToDataspecerRepresentation(): VisualRelationship | VisualProfileRelationship | null;

    /**
     * Represents the type of edge.
     */
    edgeType: OutgoingEdgeType
}

class VisualEdge {
    constructor(visualEdge: VisualRelationship | VisualProfileRelationship | null, isOutsider: boolean) {
        this.visualEdge = visualEdge;
        this.isOutsider = isOutsider;
    }

    visualEdge: VisualRelationship | VisualProfileRelationship | null;

    /**
     * True if edge has one end it outsider node, therefore it was artificially created. Otherwise it comes from visual model.
     * In case when we didn't have any visual model on input, this property can be safely ignored. (It is always false.)
     */
    isOutsider: boolean;
}


/**
 * Represents the graph edge.
 */
export class EdgeClassic implements IEdgeClassic {
    /**
     * Adds edge to given {@link graph}
     * @param extractedModels used to search for source model of edge - so not needed for non-semantic edges
     * @returns
     */
    static addNewEdgeToGraph(
        graph: IGraphClassic,
        identifier: string | null,
        visualEdge: VisualRelationship | VisualProfileRelationship | null,
        semanticEdge: AllowedEdgeTypes | null,
        sourceIdentifier: string,
        targetIdentifier: string,
        extractedModels: ExtractedModels | null,
        edgeToAddKey: OutgoingEdgeType,
    ): IEdgeClassic | null {
        const reverseEdgeToAddKey: IncomingEdgeType = convertOutgoingEdgeTypeToIncoming(edgeToAddKey);
        console.log("Adding Edge to graph", {allNodes: graph.mainGraph.allNodes, visualEdge, sourceIdentifier, targetIdentifier});
    //    console.log(graph);
    //    console.log(edge);
    //    console.log(source);
    //    console.log(targetIdentifier);
    //    console.log(edgeToAddKey);
    //    console.log(visualModel);

        const mainGraph = graph.mainGraph;
        const source = mainGraph.allNodes.find(n => n.id === sourceIdentifier);
        const target = mainGraph.allNodes.find(n => n.id === targetIdentifier);

        // console.log("targetNode");
        // console.log(targetNode);

        if(source === undefined) {
            console.warn("The source node for edge does not exists");
            return;
        }
        else if(target === undefined) {
            console.warn("The target node for edge does not exists");
            return;
        }


        let sourceModelIdentifierForEdge: string | null = null;
        if(extractedModels !== null) {
            if(edgeToAddKey === "outgoingClassProfileEdges") {
                sourceModelIdentifierForEdge = source.sourceModelIdentifier ?? null;
            }
            else {
                sourceModelIdentifierForEdge = extractedModels.entities
                    .find(entity => entity.semanticEntity.id === semanticEdge?.id)?.sourceModelIdentifier ?? null;
            }
        }


        const edgeClassic: IEdgeClassic = new EdgeClassic(
            identifier, visualEdge, semanticEdge, edgeToAddKey, graph,
            source, target, sourceModelIdentifierForEdge);
        const reverseEdgeClassic: IEdgeClassic = edgeClassic;

        source[edgeToAddKey].push(edgeClassic);
        target[reverseEdgeToAddKey].push(reverseEdgeClassic);

        return edgeClassic
    }

    private constructor(
        identifier: string | null,
        visualRelationship: VisualRelationship | VisualProfileRelationship | null,
        semanticEdge: AllowedEdgeTypes | null,
        edgeType: OutgoingEdgeType,
        sourceGraph: IGraphClassic,
        start: EdgeEndPoint,
        end: EdgeEndPoint,
        sourceModelIdentifier: string | null,
    ) {
        console.info("CREATING EDGE", this);

        sourceGraph.mainGraph.allEdges.push(this);
        this.sourceGraph = sourceGraph;
        this.isDummy = false;
        this.sourceModelIdentifier = sourceModelIdentifier;

        this.edgeProfileType = convertOutgoingEdgeTypeToEdgeProfileType(edgeType);
        this.edgeType = edgeType
        this.semanticEntityRepresentingEdge = semanticEdge;
        this.start = start;
        this.end = end;

        this.visualEdge = this.createVisualEdgeBasedOnData(visualRelationship, semanticEdge, sourceModelIdentifier, start, end);
        this.id = identifier ?? this.visualEdge.visualEdge.identifier;

        if(semanticEdge === null) {
            addToRecordArray(this.id, this, sourceGraph.mainGraph.semanticEdgeToVisualMap);
        }
        else {
            addToRecordArray(semanticEdge.id, this, sourceGraph.mainGraph.semanticEdgeToVisualMap);
        }
    }

    sourceGraph: IGraphClassic;

    sourceModelIdentifier: string | null;
    id: string;
    semanticEntityRepresentingEdge: AllowedEdgeTypes | null;
    isDummy: boolean;
    edgeProfileType: EdgeProfileType;
    isConsideredInLayout: boolean = true;
    reverseInLayout: boolean = false;

    start: EdgeEndPoint;
    end: EdgeEndPoint;

    visualEdge: VisualEdge;

    edgeType: OutgoingEdgeType;

    layoutOptions: Record<string, string> = {};

    convertToDataspecerRepresentation(): VisualRelationship | VisualProfileRelationship | null {
        return this.visualEdge.visualEdge;
    }

    // TODO: Maybe move it outside of the class since we are no longer using this.
    private createNewVisualRelationshipBasedOnSemanticDataTODONEW(
        semanticEdge: AllowedEdgeTypes,
        sourceModelIdentifier: string | null,
        start: EdgeEndPoint,
        end: EdgeEndPoint,
    ): VisualRelationship | VisualProfileRelationship {
        // TODO: It makes sense to use the cme methods to create the visual entities - Instead of implementing it all again - just define method and call it
        //      ... for example I am not sure the type should cotnain only the VISUAL_RELATIONSHIP_TYPE or also some other type, so for such cases constistency would be nice
        if(this.edgeProfileType === "CLASS-PROFILE") {
            const edgeToReturn: VisualProfileRelationship = {
                identifier: Math.random().toString(36).substring(2),
                entity: start.id,
                type: [VISUAL_PROFILE_RELATIONSHIP_TYPE],
                waypoints: [],
                model: sourceModelIdentifier ?? "",
                visualSource: start.id,
                visualTarget: end.id,
            };

            return edgeToReturn;
        }

        const edgeToReturn: VisualRelationship = {
            identifier: Math.random().toString(36).substring(2),
            type: [VISUAL_RELATIONSHIP_TYPE],
            representedRelationship: semanticEdge.id,
            waypoints: [],
            model: sourceModelIdentifier ?? "",
            visualSource: start.id,
            visualTarget: end.id,
        };

        return edgeToReturn;
    }

    private createNewVisualRelationshipBasedOnEndPoints(
        start: EdgeEndPoint,
        end: EdgeEndPoint
    ): VisualRelationship | VisualProfileRelationship {
        // TODO: It makes sense to use the cme methods to create the visual entities - Instead of implementing it all again - just define method and call it
        //      ... for example I am not sure the type should cotnain only the VISUAL_RELATIONSHIP_TYPE or also some other type, so for such cases constistency would be nice
        const edgeToReturn: VisualProfileRelationship = {
            identifier: Math.random().toString(36).substring(2),
            entity: "",
            type: [VISUAL_RELATIONSHIP_TYPE],
            waypoints: [],
            model: "",
            visualSource: start.id,
            visualTarget: end.id,
        };

        return edgeToReturn;
    }


    /**
     * @returns Either returns visual edge if given or creates new one based on semantic data
     */
    private createVisualEdgeBasedOnData(
        visualRelationship: VisualRelationship | VisualProfileRelationship | null,
        semanticEdge: AllowedEdgeTypes | null,
        sourceModelIdentifier: string | null,
        start: EdgeEndPoint,
        end: EdgeEndPoint,
    ): VisualEdge {
        if(visualRelationship !== null) {
            return new VisualEdge(visualRelationship, false);
        }
        else if(semanticEdge !== null) {
            const createdVisualRelationship = this.createNewVisualRelationshipBasedOnSemanticDataTODONEW(
                semanticEdge, sourceModelIdentifier, start, end);
            return new VisualEdge(createdVisualRelationship, true);
        }
        else {
            return new VisualEdge(this.createNewVisualRelationshipBasedOnEndPoints(start, end), true);
        }
    }
}

// TODO RadStr: Not used - I can rpobably remove this method (checkIfEdgeHasAtLeastOneOutsider) and the isRelationshipInVisualModel
const checkIfEdgeHasAtLeastOneOutsider = (
  outsiders: Record<string, XY | null>,
  start: string,
  end: string
): boolean => {
  return outsiders[start] !== undefined || outsiders[end] !== undefined;
}

/**
 * @returns Returns true if the relationship is inside the visual model or the model is null.
 */
const isRelationshipInVisualModel = (
    visualModel: VisualModel,
    entitiesToLayout: VisualEntitiesWithOutsiders,
    relationshipIdentifier: string,
    ends: [string, string]
): boolean => {
    if(visualModel === null) {
        return true;
    }

    const isAtLeastOneEndOutsider = checkIfEdgeHasAtLeastOneOutsider(entitiesToLayout.outsiders, ends[0], ends[1]);
    const visualEntity = visualModel.getVisualEntity(relationshipIdentifier);
    const isPresentInVisualModel = visualEntity !== null || isAtLeastOneEndOutsider;
    return isPresentInVisualModel;
};

/**
 * @returns Returns true if the class is inside the visual model or if the model is null.
 */
const isClassInLayoutedEntities = (
    visualModel: VisualModel,
    entitiesToLayout: VisualEntitiesWithOutsiders,
    classIdentifier: string
): boolean => {
    if(visualModel === null) {
        return true;
    }

    const visualEntity = visualModel.getVisualEntityForRepresented(classIdentifier);
    const isPresentInVisualEntitiesToLayout = visualEntity !== null &&
                                                entitiesToLayout.visualEntities.includes(visualEntity.identifier);
    const isPresentInVisualModel = isPresentInVisualEntitiesToLayout ||
                                    entitiesToLayout.outsiders[classIdentifier] !== undefined;
    return isPresentInVisualModel;
};

/**
 * @returns Returns true if both ends of the generalization exists in the visual model
 */
const isGeneralizationInVisualModel = (
    visualModel: VisualModel,
    entitiesToLayout: VisualEntitiesWithOutsiders,
    generalization: SemanticModelGeneralization
): boolean => {
    if(visualModel === null) {
        return true;
    }

    const isChildPresentInVisualModel = isClassInLayoutedEntities(visualModel, entitiesToLayout, generalization.child);
    const isParentPresentInVisualModel = isClassInLayoutedEntities(visualModel, entitiesToLayout, generalization.parent);
    return isChildPresentInVisualModel && isParentPresentInVisualModel;
};

/**
 * Possible edge point is either node or another subgraph.
 */
export type EdgeEndPoint = INodeClassic | IGraphClassic;

type EdgeProfileType = "EDGE" | "EDGE-PROFILE" | "CLASS-PROFILE";
function convertOutgoingEdgeTypeToEdgeProfileType(outgoingEdgeType: OutgoingEdgeType): EdgeProfileType {
    switch(outgoingEdgeType) {
        case "outgoingClassProfileEdges":
            return "CLASS-PROFILE"
        case "outgoingProfileEdges":
            return "EDGE-PROFILE"
        case "outgoingGeneralizationEdges":
        case "outgoingRelationshipEdges":
            return "EDGE"
        default:
            throw new Error(`Invalid OutgoingEdgeType - ${outgoingEdgeType}`);
    }
}


export const getEdgeTypeNameFromEdge = (edge: IEdgeClassic): OutgoingEdgeType => {
    if(edge.edgeProfileType === "EDGE-PROFILE") {
        return "outgoingProfileEdges";
    }
    else if(edge.edgeProfileType === "CLASS-PROFILE") {
        return "outgoingClassProfileEdges"
    }
    else if(edge.edgeProfileType === "EDGE") {
        if(isSemanticModelGeneralization(edge.semanticEntityRepresentingEdge)) {
            return "outgoingGeneralizationEdges";
        }
        else {
            return "outgoingRelationshipEdges";
        }
    }
    else {
        throw new Error(`Edge of this ${edge.edgeProfileType} type doesn't exist`);
    }
}


/**
 * The type which contains field names of the outgoing edges in {@link INodeClassic},
 * this is useful to minimize copy-paste of code, we just access the fields on node through node[key: OutgoingEdgeType].
 */
type OutgoingEdgeType = "outgoingRelationshipEdges" | "outgoingGeneralizationEdges" | "outgoingProfileEdges" | "outgoingClassProfileEdges";
export type AllowedEdgeBundleWithType = {
    semanticRelationship: AllowedEdgeBundleTypes,
    type: OutgoingEdgeType,
};


/**
 * Same as {@link OutgoingEdgeType}, but for incoming edges.
 */
type IncomingEdgeType = "incomingRelationshipEdges" | "incomingGeneralizationEdges" | "incomingProfileEdges" | "incomingClassProfileEdges" ;

export const convertOutgoingEdgeTypeToIncoming = (outgoingEdgeType: OutgoingEdgeType): IncomingEdgeType => {
    return "incoming" + capitalizeFirstLetter(outgoingEdgeType.slice("outgoing".length)) as IncomingEdgeType
};
