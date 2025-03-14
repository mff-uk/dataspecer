import { isSemanticModelGeneralization, SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { AllowedEdgeBundleTypes, EntitiesBundle, ExtractedModels, extractModelObjects, GeneralizationsBundle, getEdgeSourceAndTargetGeneralization, getEdgeSourceAndTargetRelationship, RelationshipsBundle, RelationshipsProfilesBundle } from "./layout-iface";

import { VisualModel, isVisualNode, Position, VisualEntity, VisualNode, VisualRelationship, isVisualRelationship, isVisualProfileRelationship, VisualProfileRelationship, VISUAL_PROFILE_RELATIONSHIP_TYPE, VISUAL_RELATIONSHIP_TYPE, VISUAL_NODE_TYPE, isVisualGroup } from "@dataspecer/core-v2/visual-model";
import { capitalizeFirstLetter, getBotRightPosition, getTopLeftPosition, PhantomElementsFactory, placePositionOnGrid } from "./util/utils";
import { LayoutedVisualEntity, LayoutedVisualEntities } from "./migration-to-cme-v2";
import { EntityModel } from "@dataspecer/core-v2";
import { ExplicitAnchors, isEntityWithIdentifierAnchored } from "./explicit-anchors";
import { NodeDimensionQueryHandler, ReactflowDimensionsEstimator, VisualEntitiesWithOutsiders, XY } from ".";
import { SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";

// TODO RadStr LAYOUT: After merge fix - I think that this is present in core-v2 utlities in the another open PR
/**
 * Add item, using given identifier, to respective bucket.
 * If your map is represented using {@link Map} type then use the {@link addToMapArray} instead.
 *
 * @example
 * const buckets : Record<string, any> = {}
 * addToRecordArray("bucket", {}, buckets);
 */
export function addToRecordArray<IdentifierType extends string, ValueType>(
    identifier: IdentifierType,
    value: ValueType,
    map: Record<IdentifierType, ValueType[]>,
  ): void {
    let array = map[identifier];
    if (array === undefined) {
      array = [];
      map[identifier] = array;
    }
    array.push(value);
}


type AllowedEdgeTypes = SemanticModelGeneralization |
                        SemanticModelRelationship |
                        SemanticModelRelationshipProfile |
                        null;

type AllowedVisualsForNodes = VisualNode;

function convertAllowedEdgeBundleToAllowedEdgeType(
    bundle: AllowedEdgeBundleWithType
): AllowedEdgeTypes {
    if(bundle.type === "outgoingRelationshipEdges") {
        return (bundle.semanticRelationship as RelationshipsBundle).semanticModelRelationship;
    }
    else if(bundle.type === "outgoingGeneralizationEdges") {
        return (bundle.semanticRelationship as GeneralizationsBundle).semanticModelGeneralization;
    }
    else if(bundle.type === "outgoingProfileEdges") {
        return (bundle.semanticRelationship as RelationshipsProfilesBundle).semanticModelRelationshipProfile;
    }
    return null;
}

/**
     * @returns Returns the semantic relationship - if null is returned then the relationship simply does not exist at all
     * (it is not even class profile like relationship)
     */
function getSemanticRelationshipBundle(
    identifier: string,
    extractedModels: ExtractedModels,
): AllowedEdgeBundleWithType | null {
    let semanticRelationship: AllowedEdgeBundleTypes;

    semanticRelationship = extractedModels.relationships.find(rBundle => rBundle.semanticModelRelationship.id === identifier);
    if(semanticRelationship !== undefined) {
        return {
            semanticRelationship,
            type: "outgoingRelationshipEdges",
        };
    }

    semanticRelationship = extractedModels.generalizations.find(gBundle => gBundle.semanticModelGeneralization.id === identifier);
    if(semanticRelationship !== undefined) {
        return {
            semanticRelationship,
            type: "outgoingGeneralizationEdges",
        };
    }

    semanticRelationship = extractedModels.relationshipsProfiles.find(rpBundle => rpBundle.semanticModelRelationshipProfile.id === identifier);
    if(semanticRelationship !== undefined) {
        return {
            semanticRelationship,
            type: "outgoingProfileEdges",
        };
    }

    semanticRelationship = extractedModels.classesProfiles.find(cpBundle => cpBundle.semanticModelClassProfile.id === identifier);
    if(semanticRelationship !== undefined) {
        return {
            semanticRelationship,
            type: "outgoingClassProfileEdges",
        };
    }

    return null;
}

/**
 * This is special type for situations, when we want to layout the current visual model, but we also want to find positions for nodes, which are not yet in the visual model,
 * those are stored in {@link outsiders}.
 * Use-case is for example when adding existing class back to canvas. Because if we perform the usual 2 step addition, that is:
 *    1) Add node to visual model together with all its edges
 *    2) Layout visual model
 * Then the node has to be added to some position in step 1), but we move it in step 2). That results in node jumping, which is unwanted behavior.
 *
 * The type could be in future extended with filters against visual model - when we want to layout only part of the visual model.
 * The question for this is if should just completely remove the filtered nodes from graph or set the {@link isConsideredInLayout} variable to false.
 *
 */
export type VisualModelWithOutsiders = {
    /**
     * The visual model.
     */
    visualModel: VisualModel,
    /**
     * Nodes which are not part of the visual model, but should be layouted. The key is the identifier of semantic entity
     */
    outsiders: Record<string, XY | null>,
} | null;

/**
 * Represents visual node as in the cme visual model, but with couple of additional fields - {@link width}, {@link height}, {@link isOutsider} and {@link isAnchored}, which is internal anchor,
 * because in some cases we want to anchor nodes which were not originally and anchored and also the other way around.
 * The {@link isOutsider} is used to mark nodes, which were NOT part of given visual model. We have this variable, because sometimes we want to layout nodes
 * which are not (yet) part of the visual model. In case when we didn't have any visual model on input, this property can be safely ignored. (It is always false.)
 */
export interface IVisualNodeComplete {
    coreVisualNode: VisualNode,
    width: number,
    height: number,
    isAnchored: boolean,
    isOutsider: boolean,

    /**
     * Sets the position to given one, and puts the result on grid.
     */
    setPositionInCoreVisualNode(newX: number, newY: number);
    addToPositionInCoreVisualNode(x: number, y: number);
}

export class VisualNodeComplete implements IVisualNodeComplete {
    coreVisualNode: VisualNode;
    width: number;
    height: number;
    isAnchored: boolean;
    isOutsider: boolean;

    constructor(
        coreVisualNode: VisualNode,
        width: number,
        height: number,
        useCopyOfCoreVisualNode: boolean,
        isOutsider: boolean,
        isAnchored?: boolean
    ) {
        if(useCopyOfCoreVisualNode) {
            // TODO: Maybe deep copy?
            this.coreVisualNode = {...coreVisualNode};
        }
        else {
            this.coreVisualNode = coreVisualNode;
        }
        this.width = width;
        this.height = height;
        this.isOutsider = isOutsider;
        if(isAnchored === undefined) {
            this.isAnchored = coreVisualNode?.position?.anchored ?? false;
        }
        else {
            this.isAnchored = isAnchored;
        }
    }
    setPositionInCoreVisualNode(newX: number, newY: number) {
        this.coreVisualNode.position.x = newX;
        this.coreVisualNode.position.y = newY;
        placePositionOnGrid(this.coreVisualNode.position, 10, 10);
    }

    addToPositionInCoreVisualNode(x: number, y: number) {
        const newX = this.coreVisualNode.position.x + x;
        const newY = this.coreVisualNode.position.y + y;
        this.setPositionInCoreVisualNode(newX, newY);
    }
}

// TODO: This doesn't really make sense, just have interface IGraph which represents any graph
//       (it will have only methods manipulating with it - addNode, ...), so something similiar to interface Graph (at top of the file)
/**
 * Interface which represents the (sub)graph,
 */
export interface IGraphClassic extends INodeClassic {
    layoutOptions: Record<string, string>;

    /**
     * Maps the visual identifier of node to the node.
     */
    nodes: Record<string, EdgeEndPoint>,
    initializeWithGivenContent(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        nodeContentOfGraph: Array<EdgeEndPoint> | null,
        isDummy: boolean,
        nodeDimensionQueryHandler?: NodeDimensionQueryHandler | null);
    initialize(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        inputModels: Map<string, EntityModel> | ExtractedModels | null,
        isDummy: boolean,
        visualModel: VisualModel,
        entitiesToLayout: VisualEntitiesWithOutsiders,
        nodeDimensionQueryHandler?: NodeDimensionQueryHandler | null,
        explicitAnchors?: ExplicitAnchors);
    insertSubgraphToGraph(subgraph: IGraphClassic, nodesInSubgraph: Array<EdgeEndPoint>, shouldSplitEdges: boolean): void;
}

// export class GraphFactory {
//     createGraphFromSemanticModel(inputModel: Record<string, SemanticModelEntity> | ExtractedModel): IGraphClassic {

//     }

//     createGraphFromSemanticModels(): IGraphClassic {
//         throw new Error("Basically same as for one");

//     }

//     createGraphFromVisualModel(visualModel, semanticMdels): IGraphClassic {
//         // What does it mean??? Take the visual model and that's it and map it to the semantic one
//     }

//     createGraphFromVisualModels(visualModel, semanticMdels): IGraphClassic {
//         throw new Error("Implement me later");
//     }
// }

// TODO: Well actually the "evolution" is one place where we can use constraints - we enumerate the nodes which are part of evolution


/**
 * The reason for this is, that for example d3.js likes to have complete list of nodes and edges stored somewhere. Which is ok, but up until now
 * we extepcted the nodes/edges to be hierarchic - i.e. if there is group node - the graph above it only stores the group node and the content of the group node is
 * available only from the group node and not anywhere else.
 */
export interface IMainGraphClassic extends IGraphClassic {
    /**
     * Maps the semantic node to all its visuals.
     *
     * If the entity does not have semantic equivalent, its visual one is used as a key
     */
    semanticNodeToVisualMap: Record<string, EdgeEndPoint[]>,


    // TODO RadStr: Maybe not needed
    /**
     * Maps the semantic edge to all its visuals.
     *
     * If the entity does not have semantic equivalent, its visual one is used as a key
     */
    semanticEdgeToVisualMap: Record<string, EdgeClassic[]>,

    /**
     * List of all nodes/subgraphs in the graph.
     */
    allNodes: EdgeEndPoint[],
    /**
     * List of all edges in the graph.
     */
    allEdges: IEdgeClassic[],       // TODO: Kdyz uz mam tyhle edges, tak to potencionalne muzu mit jako mapu a v ramci tech nodu si jen pamatovat ID misto celych objektu, ale je to celkem jedno
                                    //       (+ tohle pak nebude pole, respektvie bych si ho musel ziskavat skrz Object.values)

    nodeDimensionQueryHandler: NodeDimensionQueryHandler;

    // TODO: Maybe map to make it faster
    findNodeInAllNodes(nodeIdentifier: string): EdgeEndPoint | null,
    findEdgeInAllEdges(edgeIdentifier: string): IEdgeClassic | null,
    findNodeIndexInAllNodes(nodeIdentifier: string): number | null,
    findEdgeIndexInAllEdges(edgeIdentifier: string): number | null,
    /**
     * Call this method on the "wrapper" graph to convert all entities within the graph to VisualEntites which can be used in Visual model
     */
    convertWholeGraphToDataspecerRepresentation(): LayoutedVisualEntities,
    /**
     * This method goes through all the nodes, subgraphs and edges inside this graph and sets properties modifying graph to default state - mainly {@link isConsideredInLayout} and reverseInLayout on edges
     */
    resetForNewLayout(): void,


    // TODO: Currently doesn't have reverse operation
    /**
     * Create generalization subgraphs.
     */
    createGeneralizationSubgraphs(): void,
}


/**
 * Factory class to create graphs with.
 */
export class GraphFactory {
    /**
     * Creates graph, which is put inside the {@link mainGraph}
     * @param inputModel if null then {@link nodeContentOfGraph} needs to be set, otherwise behavior is undefined
     * @param nodeContentOfGraph the nodes which are part of the new subgraph.
     *                           The nodes are put inside of the created subgraph and in the {@link sourceGraph} are shown as one node - the newly created graph.
     * ... TODO: for now can't be null, in future it might make sense to be null.
     * For example when he we have one visual model and then we want to create subgraph which has other visual model as content (... TODO: but what about shared nodes?)
     * @param isDummy
     * @param visualModel
     * @param shouldSplitEdges if set to true, then split edges. If set to false, then just paste in the subgraph the nodes, but this results in edges going from
     * the subgraph to possibly other subgraphs, which for example elk can not deal with. In Elk the edges have to go between nodes on the same level.
     * So for this edges the split edges option. Then edge is split into 2 or 3 parts. (Note: If the edge is inside the subgraph it is kept)
     * 1st edge - From the node in the subgraph to the subgraph.
     * 2nd edge - Either the edge straight to the node, if it doesn't lies within different subgraph, or of it does, then the next part of edge goes between the subgraphs.
     * 3rd edge - from the other subgraph to the other end of the original edge.
     * @returns the created subgraph
     */
    public static createGraph(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        nodeContentOfGraph: Array<EdgeEndPoint> | null,
        isDummy: boolean,
        shouldSplitEdges: boolean
    ): IGraphClassic {
        // Create subgraph which has given nodes as children (TODO: What if the nodes are not given, i.e. null?)
        const graph = new GraphClassic();
        graph.initializeWithGivenContent(
            mainGraph, sourceGraph, graphIdentifier,
            nodeContentOfGraph, isDummy, mainGraph.nodeDimensionQueryHandler);
        sourceGraph.insertSubgraphToGraph(graph, nodeContentOfGraph, shouldSplitEdges);
        return graph;
    }


    /**
     * Creates instance of main graph. Main graph is like classic subgraph, but contains additional data about all the entities stored in graph.
     * TODO: Actually do I get any advantage by having additional type (except for saving space) and what starts happening when we have subgraphs inside subgraphs???
     */
    public static createMainGraph(
        graphIdentifier: string | null,
        inputModels: Map<string, EntityModel> | ExtractedModels | null,
        visualModel: VisualModel,
        entitiesToLayout: VisualEntitiesWithOutsiders,
        nodeDimensionQueryHandler?: NodeDimensionQueryHandler | null,
        explicitAnchors?: ExplicitAnchors
    ): IMainGraphClassic {
        if(graphIdentifier === null) {
            graphIdentifier = PhantomElementsFactory.createUniquePhanomNodeIdentifier();
        }
        const graph = new MainGraphClassic();
        graph.initialize(
            graph, graph, graphIdentifier, inputModels, false,
            visualModel, entitiesToLayout, nodeDimensionQueryHandler, explicitAnchors);
        return graph;
    }

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
 * @returns Returns true if the node is inside the visual model or
 * if the model is null or if the given {@link classIdentifier} is inside {@link outsiders}.
 */
const isNodeInVisualModel = (
    visualModel: VisualModel,
    entitiesToLayout: VisualEntitiesWithOutsiders,
    node: AllowedVisualsForNodes | null,
    classIdentifier: string
): boolean => {
    if(visualModel === null) {
        return true;
    }

    const visualEntity = visualModel.getVisualEntityForRepresented(classIdentifier);
    const isPresentInVisualEntitiesToLayout = visualEntity !== null &&
                                                entitiesToLayout.visualEntities.includes(visualEntity.identifier);
    const isPresentInVisualModel = node !== null ||
                                    isPresentInVisualEntitiesToLayout ||
                                    entitiesToLayout.outsiders[classIdentifier] !== undefined;
    return isPresentInVisualModel;
};

/**
 * @returns Returns true if the class is inside the visual model or if the model is null.
 */
const isClassInLayoutedEntites = (
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


// TODO: Again something to probably change in cme-v2
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

    const isChildPresentInVisualModel = isClassInLayoutedEntites(visualModel, entitiesToLayout, generalization.child);
    const isParentPresentInVisualModel = isClassInLayoutedEntites(visualModel, entitiesToLayout, generalization.parent);
    return isChildPresentInVisualModel && isParentPresentInVisualModel;
};


/**
 * Class which stores (sub)graph.
 */
export class GraphClassic implements IGraphClassic {
    private initializeGraphMetadata(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        isDummy: boolean,
        nodeDimensionQueryHandler: NodeDimensionQueryHandler | null,
    ) {
        this.sourceGraph = sourceGraph;
        if(!(this instanceof MainGraphClassic)) {
            mainGraph.allNodes.push(this);
        }
        else {
            if(nodeDimensionQueryHandler === undefined || nodeDimensionQueryHandler === null) {
                nodeDimensionQueryHandler = new ReactflowDimensionsEstimator();
            }
            this.nodeDimensionQueryHandler = nodeDimensionQueryHandler;
        }
        this.mainGraph = mainGraph;
        this.id = graphIdentifier;
        this.isDummy = isDummy;
        this.sourceEntityModelIdentifier = null;
    }

    initializeWithGivenContent(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        nodeContentOfGraph: Array<EdgeEndPoint>,
        isDummy: boolean,
        nodeDimensionQueryHandler: NodeDimensionQueryHandler | null,
    ) {

        this.initializeGraphMetadata(mainGraph, sourceGraph, graphIdentifier, isDummy, nodeDimensionQueryHandler);

        const nodesMap = {};
        for(const node of nodeContentOfGraph) {
            nodesMap[node.id] = node;
            node.setSourceGraph(this);
        }
        this.nodes = nodesMap;
        const visualNodeRepresentingGraph = this.createNewVisualNodeForGraphBasedOnContainedNodes();
        const topLeft = getTopLeftPosition(Object.values(this.nodes));
        const botRight = getBotRightPosition(Object.values(this.nodes));
        const width = botRight.x - topLeft.x;
        const height = botRight.y - topLeft.y;
        visualNodeRepresentingGraph.position = { ...topLeft, anchored: null };
        this.completeVisualNode = new VisualNodeComplete(visualNodeRepresentingGraph, width, height, false, false);
        console.info("this.completeVisualNode representing graph", {cvn: {...this.completeVisualNode}});
    }

    private createNewVisualNodeForGraphBasedOnContainedNodes() {
        const position = getTopLeftPosition(Object.values(this.nodes));
        return {
            identifier: this.id,
            type: [VISUAL_NODE_TYPE],
            representedEntity: this.id,
            position: {
                ...position,
                anchored: null,
            },
            content: [],
            visualModels: [],
            model: "",
        };
    }


    /**
     * Initializes instance of this graph, the reason why this is not part of the constructor is that since {@link MainGraphClassic} extends this class,
     * it uses the same initialize method, that results in situation that we can't update the list of all nodes in the constructor, since they are not initialized.
     */
    initialize(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        inputModels: Map<string, EntityModel> | ExtractedModels | null,
        isDummy: boolean,
        visualModel: VisualModel,
        entitiesToLayout: VisualEntitiesWithOutsiders,
        nodeDimensionQueryHandler?: NodeDimensionQueryHandler | null,
        explicitAnchors?: ExplicitAnchors
    ) {

        this.initializeGraphMetadata(mainGraph, sourceGraph, graphIdentifier, isDummy, nodeDimensionQueryHandler);

        if(inputModels === null) {
            return;
        }

        // https://stackoverflow.com/questions/46703364/why-does-instanceof-in-typescript-give-me-the-error-foo-only-refers-to-a-ty
        // Just simple check, dont check all elements it is not necessary
        const areInputModelsExtractedModels = (inputModels as ExtractedModels).entities && (inputModels as ExtractedModels).generalizations;
        const extractedModels = areInputModelsExtractedModels ? (inputModels as ExtractedModels) : extractModelObjects(inputModels as Map<string, EntityModel>);


        console.info("extractedModels");
        console.info(extractedModels);

        this.createGraphNodes(entitiesToLayout, visualModel, extractedModels, explicitAnchors);
        this.createGraphEdges(entitiesToLayout, visualModel, extractedModels);
        this.createGraphGroups(entitiesToLayout, visualModel, extractedModels);

        console.info("THIS GRAPH:", this);
    }

    private createGraphNodes(
        entitiesToLayout: VisualEntitiesWithOutsiders,
        visualModel: VisualModel | null,
        extractedModels: ExtractedModels,
        explicitAnchors?: ExplicitAnchors
    ) {
        if(visualModel !== null) {
            const nodes = entitiesToLayout.visualEntities
                .map(entity => visualModel.getVisualEntity(entity))
                .filter(entity => entity !== null)
                .filter(isVisualNode);
            for(const node of nodes) {
                const cclass = extractedModels.classes.find(cclass => cclass.semanticModelClass.id === node.representedEntity);
                if(cclass !== undefined) {
                    addNodeTODO(
                        this.mainGraph, node, cclass.semanticModelClass, false, cclass.sourceEntityModelIdentifier,
                        extractedModels, this, visualModel, entitiesToLayout, null, explicitAnchors);
                }
                else {
                    const classProfile = extractedModels.classesProfiles
                        .find(classProfile => classProfile.semanticModelClassProfile.id === node.representedEntity);
                    if(classProfile === undefined) {
                        console.error("Node is neither class or class profile");
                        // TODO RadStr: We do have nodes which don't have semantic equivalent
                        throw new Error("Implementation error")
                        return;
                    }
                    addNodeTODO(
                        this.mainGraph, node, classProfile.semanticModelClassProfile, true,
                        classProfile.sourceEntityModelIdentifier, extractedModels, this,
                        visualModel, entitiesToLayout, null, explicitAnchors);
                }
            }
        }

        for(const [outsider, position] of Object.entries(entitiesToLayout.outsiders)) {
            // Basically same as for the visual nodes - so TODO: If time try to refactor into one method
            const cclass = extractedModels.classes.find(cclass => cclass.semanticModelClass.id === outsider);
            if(cclass !== undefined) {
                addNodeTODO(
                    this.mainGraph, null, cclass.semanticModelClass, false, cclass.sourceEntityModelIdentifier,
                    extractedModels, this, visualModel, entitiesToLayout, position, explicitAnchors);
            }
            else {
                const classProfile = extractedModels.classesProfiles
                    .find(classProfile => classProfile.semanticModelClassProfile.id === outsider);
                if(classProfile === undefined) {
                    console.error("outsider is neither class or class profile");
                    throw new Error("Implementation error")
                    return;
                }
                addNodeTODO(
                    this.mainGraph, null, classProfile.semanticModelClassProfile, true,
                    classProfile.sourceEntityModelIdentifier, extractedModels, this,
                    visualModel, entitiesToLayout, position, explicitAnchors);
            }
        }
    }

    /**
     * Expects that the ends of edges to already exist.
     */
    private createGraphEdges(
        entitiesToLayout: VisualEntitiesWithOutsiders,
        visualModel: VisualModel | null,
        extractedModels: ExtractedModels
    ) {
        const sourceGraph = this;           // TODO RadStr: Probably not needed
        if(visualModel !== null) {
            const relationshipEdges = entitiesToLayout.visualEntities
                .map(visualId => visualModel.getVisualEntity(visualId))
                .filter(entity => entity !== null)
                .filter(edge => isVisualRelationship(edge));
            const classProfilesEdges = entitiesToLayout.visualEntities
                .map(visualId => visualModel.getVisualEntity(visualId))
                .filter(entity => entity !== null)
                .filter(edge => isVisualProfileRelationship(edge));

            for(const edge of relationshipEdges) {
                const semanticRelationshipBundle = getSemanticRelationshipBundle(edge.representedRelationship, extractedModels);
                if(semanticRelationshipBundle === undefined || semanticRelationshipBundle === null) {
                    // TODO RadStr: Maybe we don't have to skip it - it might work even without the semantic counter-part
                    console.warn("The visual relationship is not present in the semantic model");
                    continue;
                }

                let semanticRelationship: AllowedEdgeTypes = convertAllowedEdgeBundleToAllowedEdgeType(semanticRelationshipBundle);

                EdgeClassic.addNewEdgeToGraph(
                    sourceGraph, null, edge, semanticRelationship,
                    edge.visualSource, edge.visualTarget,
                    extractedModels, semanticRelationshipBundle.type);
            }
            for(const edge of classProfilesEdges) {
                const semanticClassProfile = getSemanticRelationshipBundle(edge.entity, extractedModels);
                if(semanticClassProfile === undefined) {
                    // TODO RadStr: Maybe we don't have to skip it - it might work even without the semantic counter-part
                    console.warn("The visual relationship is not present in the semantic model");
                    continue;
                }
                EdgeClassic.addNewEdgeToGraph(
                    sourceGraph, null, edge, null,
                    edge.visualSource, edge.visualTarget,
                    extractedModels, "outgoingClassProfileEdges");
            }
        }


        const relationships = extractedModels.relationships
            .filter(relationshipBundle => {
                return checkIfEdgeShouldBePartOfGraph(
                    visualModel,
                    entitiesToLayout,
                    relationshipBundle.semanticModelRelationship.ends[0].concept,
                    relationshipBundle.semanticModelRelationship.ends[1].concept);
                }
            )
            .map(relationshipBundle => relationshipBundle.semanticModelRelationship);

        console.info("relationships", {relationships});
        relationships.forEach((relationship) => {
            const { domain, range } = getDomainAndRange(relationship);
            const semanticStart = domain.concept;
            const semanticEnd = range.concept;
            if(entitiesToLayout.outsiders[semanticStart] === undefined &&       // It was already added
                entitiesToLayout.outsiders[semanticEnd] === undefined) {
                return;
            }

            let visualStarts = this.mainGraph.semanticNodeToVisualMap[semanticStart];
            let visualEnds = this.mainGraph.semanticNodeToVisualMap[semanticEnd];

            for(const visualStart of visualStarts) {
                for(const visualEnd of visualEnds) {
                    EdgeClassic.addNewEdgeToGraph(
                        sourceGraph, null, null, relationship,
                        visualStart.id, visualEnd.id,
                        extractedModels, "outgoingRelationshipEdges");
                }
            }
        });
        //
        const generalizations = extractedModels.generalizations
            .filter(generalizationBundle => {
                return checkIfEdgeShouldBePartOfGraph(
                    visualModel,
                    entitiesToLayout,
                    generalizationBundle.semanticModelGeneralization.child,
                    generalizationBundle.semanticModelGeneralization.parent);
                }
            )
            .map(generalizationBundle => generalizationBundle.semanticModelGeneralization);
        generalizations.forEach((generalization) => {
            const semanticStart = generalization.child;
            const semanticEnd = generalization.parent;
            if(entitiesToLayout.outsiders[semanticStart] === undefined &&       // It was already added
                entitiesToLayout.outsiders[semanticEnd] === undefined) {
                return;
            }

            let visualStarts = this.mainGraph.semanticNodeToVisualMap[semanticStart];
            let visualEnds = this.mainGraph.semanticNodeToVisualMap[semanticEnd];

            for(const visualStart of visualStarts) {
                for(const visualEnd of visualEnds) {
                    EdgeClassic.addNewEdgeToGraph(
                        sourceGraph, null, null, generalization,
                        visualStart.id, visualEnd.id,
                        extractedModels, "outgoingGeneralizationEdges");
                }
            }
        });
        //
        const relationshipsProfiles = extractedModels.relationshipsProfiles
            .filter(relationshipProfileBundle => {
                return checkIfEdgeShouldBePartOfGraph(
                    visualModel,
                    entitiesToLayout,
                    relationshipProfileBundle.semanticModelRelationshipProfile.ends[0].concept,
                    relationshipProfileBundle.semanticModelRelationshipProfile.ends[1].concept);
                }
            )
            .map(relationshipProfileBundle => relationshipProfileBundle.semanticModelRelationshipProfile);
        relationshipsProfiles.forEach((relationshipProfile) => {
            const semanticStart = relationshipProfile.ends[0].concept;
            const semanticEnd = relationshipProfile.ends[1].concept;
            if(entitiesToLayout.outsiders[semanticStart] === undefined &&       // It was already added
                entitiesToLayout.outsiders[semanticEnd] === undefined) {
                return;
            }

            let visualStarts = this.mainGraph.semanticNodeToVisualMap[semanticStart];
            let visualEnds = this.mainGraph.semanticNodeToVisualMap[semanticEnd];

            for(const visualStart of visualStarts) {
                for(const visualEnd of visualEnds) {
                    EdgeClassic.addNewEdgeToGraph(
                        sourceGraph, null, null, relationshipProfile,
                        visualStart.id, visualEnd.id,
                        extractedModels, "outgoingProfileEdges");
                }
            }
        });
        //
        const toClassProfileEdges: {
            source: SemanticModelClassProfile,
            target: string,
        }[] = [];
        for(const classProfileBundle of extractedModels.classesProfiles) {
            for(const profileOf of classProfileBundle.semanticModelClassProfile.profiling) {
                if(checkIfEdgeShouldBePartOfGraph(
                        visualModel,
                        entitiesToLayout,
                        classProfileBundle.semanticModelClassProfile.id, profileOf)) {
                    toClassProfileEdges.push({
                        source: classProfileBundle.semanticModelClassProfile,
                        target: profileOf
                    });
                }
            }
        }
        for(const toClassProfileEdge of toClassProfileEdges) {
            const semanticStart = toClassProfileEdge.source.id;
            const semanticEnd = toClassProfileEdge.target;
            if(entitiesToLayout.outsiders[semanticStart] === undefined &&       // It was already added
                entitiesToLayout.outsiders[semanticEnd] === undefined) {
                return;
            }

            let visualStarts = this.mainGraph.semanticNodeToVisualMap[semanticStart];
            let visualEnds = this.mainGraph.semanticNodeToVisualMap[semanticEnd];

            for(const visualStart of visualStarts) {
                for(const visualEnd of visualEnds) {
                    EdgeClassic.addNewEdgeToGraph(
                        sourceGraph, null, null, null,
                        visualStart.id, visualEnd.id,
                        extractedModels, "outgoingClassProfileEdges");
                }
            }
        }
    }

    private createGraphGroups(
        entitiesToLayout: VisualEntitiesWithOutsiders,
        visualModel: VisualModel | null,
        extractedModels: ExtractedModels
    ) {
        if(visualModel !== null) {
            const groups = entitiesToLayout.visualEntities
                .map(entity => visualModel.getVisualEntity(entity))
                .filter(entity => entity !== null)
                .filter(isVisualGroup);
            for(const group of groups) {
                // TODO RadStr LAYOUT: We will have to write the getTopLevelGroup method again, otherwise this does not work

                const nodesInSubgraph = group.content
                    .map(identifier => this.mainGraph.findNodeInAllNodes(identifier));
                GraphFactory.createGraph(
                    this.mainGraph, this, group.identifier, nodesInSubgraph, true, true);
            }
        }
    }

    private isEdgeInsideGraph(edge: IEdgeClassic): boolean {
        return edge.start.getSourceGraph() === this || edge.end.getSourceGraph() === this;
    }

    public createGeneralizationSubgraphs() {
        const generalizationEdges: SemanticModelGeneralization[] = [];
        this.mainGraph.allEdges.forEach(edge => {
            // TODO: Not sure if it actually has to be inside the graph or it can go beyond
            if(isSemanticModelGeneralization(edge.semanticEntityRepresentingEdge) && this.isEdgeInsideGraph(edge)) {
                generalizationEdges.push(edge.semanticEntityRepresentingEdge);
            }
        })

        // We pass in no visual model, since it is expected that the edges in the graph are exactly those which were at the visual model at the time of creation
        this.createGeneralizationSubgraphsInternal(generalizationEdges, null);
    }



    // TODO: Only reason why we need visualModel is because in the cme-v1 we can't easily tell if generalization is part of the visual model.
    /**
     * Creates generalization subgraphs. The subgraphs are maximal, meaning any node which can be reached through the generalization path is in the subgraph.
     */
    private createGeneralizationSubgraphsInternal(
        generalizationEdges: SemanticModelGeneralization[],
        visualModel: VisualModel
    ): IGraphClassic[] {
        // For now 1 whole hierarchy (n levels) == 1 subgraph
        let parents: Record<string, string[]> = {};
        let children: Record<string, string[]> = {};
        generalizationEdges.forEach(g => {
            if(parents[g.child] === undefined) {
                parents[g.child] = [];
            }
            parents[g.child].push(g.parent);

            if(children[g.parent] === undefined) {
                children[g.parent] = [];
            }
            children[g.parent].push(g.child);
        });

        const subgraphs: string[][] = this.findGeneralizationSubgraphs(parents, children);
        let generalizationSubgraphs: EdgeEndPoint[][] = subgraphs.map(subgraph => {
            // This removes the labels, so it is better to just paste in the original node
            // TODO: Or maybe the copy of it, but for now just paste in the original one
            // return subgraph.map(nodeID => this.createNode(nodeID, true));     // TODO: What about subgraphs inside subgraphs

            // TODO: Expects that that are no subgraphs in children
            // TODO RadStr LAYOUT: - Accessing the first one, that is [0] - which is wrong for multi entities - i guess that jsut iterate through everything using for cycle
            return subgraph.map(nodeID => this.nodes[this.mainGraph.semanticNodeToVisualMap[nodeID][0].id]);
        });

        console.log("Generated subgraphs:");
        console.log(subgraphs);
        console.log(generalizationSubgraphs);
        // TODO: Just as in the relationships (in case of Schema.org) we have to remove the nodes which are not part of model
        // TODO: This is exactly the reason why I need to have my own graph representation as single source of truth - because here I am again
        //       removing nodes which shouldn't be in the graph in the first place, because I already removed them
        generalizationSubgraphs = generalizationSubgraphs.map(subgraph => subgraph.filter(node => node !== undefined));
        console.log(generalizationSubgraphs);


        let createdSubgraphs: Array<IGraphClassic> = [];
        generalizationSubgraphs.forEach(nodesInSubgraph => {
            createdSubgraphs.push(this.createGeneralizationSubgraphAndInsertInGraph(nodesInSubgraph));
        });


        return createdSubgraphs;
    }


    /**
     * Finds generalization subgraphs. The subgraphs are maximal, meaning any node which can be reached through the generalization path is in the subgraph.
     * @param parents is record maps node id to its parents (in the generalization hierarchy)
     * @param children is record maps node id to its children (in the generalization hierarchy)
     * @returns Returns 2D string array representing the subgraphs. So each string[] is one generalization subgraph.
     */
    findGeneralizationSubgraphs(parents: Record<string, string[]>, children: Record<string, string[]>): string[][] {
        let subgraphs: Record<string, number> = {};
        let stack: string[] = [];
        let currSubgraph = -1;

        for(let [child, concreteParents] of Object.entries(parents)) {
            if(subgraphs[child] === undefined) {
                currSubgraph++;
                stack.push(child);
                subgraphs[stack[0]] = currSubgraph;
            }

            while(stack.length > 0) {
                let currNode = stack.pop();
                parents[currNode] = parents[currNode] === undefined ? [] : parents[currNode];
                children[currNode] = children[currNode] === undefined ? [] : children[currNode];
                parents[currNode].concat(children[currNode]).forEach(n => {
                    if(subgraphs[n] === undefined) {
                        subgraphs[n] = currSubgraph;
                        stack.push(n);
                    }
                });
            }
        }
        currSubgraph++;     // So it is the same as number of subgraphs



        let subgraphsAsArrays: string[][] = [];
        for(let i = 0; i < currSubgraph; i++) {
            subgraphsAsArrays.push([]);
        }
        Object.entries(subgraphs).forEach(([nodeID, subgraphID]) => subgraphsAsArrays[subgraphID].push(nodeID));

        return subgraphsAsArrays;
    }



    // We have it as instance method, this way the identifiers are consistent between two graphs
    private subgraphUniqueIdentifier = 0;
    private createUniqueGeneralizationSubgraphIdentifier(): string {
        const identifier = `subgraph-${this.subgraphUniqueIdentifier}`;
        this.subgraphUniqueIdentifier++;

        return identifier;
    }

    /**
     * Creates the generalization subgraph and inserts into this instance of graph
     */
    createGeneralizationSubgraphAndInsertInGraph(nodesInSubgraph: Array<EdgeEndPoint>): IGraphClassic {
        const identifier = this.createUniqueGeneralizationSubgraphIdentifier();
        const subgraph: IGraphClassic = GraphFactory.createGraph(
            this.mainGraph, this, identifier, nodesInSubgraph, true, true);
        return subgraph;
    }

    insertSubgraphToGraph(subgraph: IGraphClassic, nodesInSubgraph: Array<EdgeEndPoint>, shouldSplitEdges: boolean): void {
        // Repair the old graph by substituting the nodes by the newly created subgraph
        this.replaceNodesInOriginalGraphWithTheSubgraph(subgraph, nodesInSubgraph);
        console.log("After changeNodesInOriginalGraph");
        if(shouldSplitEdges) {
            // Repair edges by splitting them into two parts
            this.splitEdgesGoingBeyondSubgraph(subgraph, nodesInSubgraph);
            console.log("After repairEdgesInOriginalGraph");
        }
    }

    /**
     * Replaces the {@link nodesInSubgraph} stored in this instance of graph with one node (respectively graph) which stores them - the {@link subgraph}
     */
    replaceNodesInOriginalGraphWithTheSubgraph(subgraph: IGraphClassic, nodesInSubgraph: Array<EdgeEndPoint>) : void {
        for(const nodeInSubgraph of nodesInSubgraph) {
            delete this.nodes[nodeInSubgraph.id];
        }
        this.nodes[subgraph.id] = subgraph;
    }


    /**
     * Splits edges, the act of splitting is explained the {@link GraphFactory.createGraph}
     */
    splitEdgesGoingBeyondSubgraph(subgraph: IGraphClassic, changedNodes: Array<EdgeEndPoint>): void {
        this.splitEdgesGoingBeyondSubgraphInternal(subgraph, changedNodes, "sources");
        this.splitEdgesGoingBeyondSubgraphInternal(subgraph, changedNodes, "targets");
    }


    /**
     *
     * @param edgeEnd is either "sources" or "targets", if it is sources then it repairs edges going out of subgraph, "targets" then going in
     */
    private splitEdgesGoingBeyondSubgraphInternal(subgraph: IGraphClassic, changedNodes: Array<EdgeEndPoint>, edgeEnd: "sources" | "targets") {
        console.log("START OF repairEdgesGoingBeyondSubgraphInternal");
        console.log(subgraph.mainGraph);

        const edgesGoingBeyond: IEdgeClassic[] = [];

        const nodesInsideSubgraph = changedNodes.concat(subgraph);
        if(edgeEnd === "sources") {
            changedNodes.forEach(node => {
                console.info("sources");
                console.info([...node.getAllOutgoingEdges()]);
                for(const edge of node.getAllOutgoingEdges()) {
                    if(nodesInsideSubgraph.find(changedNode => changedNode.id === edge.end.id) === undefined) {
                        edgesGoingBeyond.push(edge);
                    }
                }
            });
        }
        else if(edgeEnd === "targets") {
            changedNodes.forEach(node => {
                console.info("targets");
                console.info([...node.getAllOutgoingEdges()]);
                for(const edge of node.getAllIncomingEdges()) {
                    if(nodesInsideSubgraph.find(changedNode => changedNode.id === edge.start.id) === undefined) {
                        edgesGoingBeyond.push(edge);
                    }
                }
            });
        }

        console.log("BEFORE GOING TO splitEdgeIntoTwo");
        console.log(edgesGoingBeyond);

        // TODO: Actually ... should visual model contain ports?? And should I have them here in my representation????!!!
        edgesGoingBeyond.forEach(e => this.splitEdgeIntoTwo(e, subgraph));
    }

    /**
     * Performs the edge splitting - Constructs identifiers of the new edges, removes the old one and creates two new ones.
     * One going from the start node to the subgraph and the other from the subgraph to the other end.
     */
    splitEdgeIntoTwo(edge: IEdgeClassic, subgraph: IGraphClassic): void {
        this.removeEdge(edge);
        const firstSplitIdentifier = PhantomElementsFactory.constructSplitID(edge.id, 0);
        const secondSplitIdentifier = PhantomElementsFactory.constructSplitID(edge.id, 1);

        EdgeClassic.addNewEdgeToGraph(
            subgraph, firstSplitIdentifier, null, edge.semanticEntityRepresentingEdge, edge.visualEdge.visualEdge.visualSource,
            subgraph.id, null, getEdgeTypeNameFromEdge(edge));
        EdgeClassic.addNewEdgeToGraph(
            subgraph, secondSplitIdentifier, null, edge.semanticEntityRepresentingEdge, subgraph.id,
            edge.visualEdge.visualEdge.visualTarget, null, getEdgeTypeNameFromEdge(edge));
    }


    /**
     * Removes given edge from nodes on both ends and also removes it from list of all edges of the main graph.
     */
    removeEdge(edge: IEdgeClassic) {
        const edgeType = getEdgeTypeNameFromEdge(edge);
        const reverseEdgeType = convertOutgoingEdgeTypeToIncoming(edgeType);

        let index = edge.start[edgeType].indexOf(edge);
        edge.start[edgeType].splice(index, 1);
        index = edge.end[reverseEdgeType].indexOf(edge);
        edge.end[reverseEdgeType].splice(index, 1);

        // TODO: Put into separate method ... probably should be just method on the main graph which gets graph as argument
        index = this.mainGraph.findEdgeIndexInAllEdges(edge.id);
        this.mainGraph.allEdges.splice(index, 1);
    }


    convertToDataspecerRepresentation(): VisualNode | null {
        return this.completeVisualNode?.coreVisualNode ?? null;
    }


    nodes: Record<string, EdgeEndPoint> = {};

    sourceGraph: IGraphClassic;
    mainGraph: IMainGraphClassic;

    id: string = "";
    sourceEntityModelIdentifier: string | null;
    semanticEntityRepresentingNode: SemanticModelEntity | null = null;
    isDummy: boolean = true;
    isMainEntity: boolean = false;
    isProfile: boolean = false;
    isConsideredInLayout: boolean = true;     // TODO: Create setter/getter instead (iface vs class ... this will need change on lot of places)
    layoutOptions: Record<string, string> = {};


    setOutgoingClassProfileEdge(outgoingClassProfileEdge: IEdgeClassic) {
        throw new Error("Graphs can't be profiled.");
    }

    outgoingClassProfileEdges: Array<IEdgeClassic> = [];
    incomingClassProfileEdges: Array<IEdgeClassic> = [];

    outgoingRelationshipEdges: Array<IEdgeClassic> = [];
    incomingRelationshipEdges: Array<IEdgeClassic> = [];

    outgoingGeneralizationEdges: Array<IEdgeClassic> = [];
    incomingGeneralizationEdges: Array<IEdgeClassic> = [];

    outgoingProfileEdges: Array<IEdgeClassic> = [];
    incomingProfileEdges: Array<IEdgeClassic> = [];
    getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown> {
        return getAllIncomingEdges(this);
    }

    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown> {
        return getAllOutgoingEdges(this);
    }

    getAllEdges(): Generator<IEdgeClassic, string, unknown> {
        return getAllEdges(this);
    }

    completeVisualNode: IVisualNodeComplete;

    getAttributes(): SemanticModelRelationship[] {
        return [];
    }
    getSourceGraph(): IGraphClassic | null {
        return this.sourceGraph;
    }
    setSourceGraph(sourceGraph: IGraphClassic): void {
        this.sourceGraph = sourceGraph;
    }
}


export class MainGraphClassic extends GraphClassic implements IMainGraphClassic {
    semanticNodeToVisualMap: Record<string, EdgeEndPoint[]> = {};
    semanticEdgeToVisualMap: Record<string, EdgeClassic[]> = {};
    allNodes: EdgeEndPoint[] = [];
    allEdges: IEdgeClassic[] = [];
    nodeDimensionQueryHandler: NodeDimensionQueryHandler;

    findNodeInAllNodes(nodeIdentifier: string): EdgeEndPoint | null {
        return this.allNodes.find(node => node.id === nodeIdentifier);
    }
    findEdgeInAllEdges(edgeIdentifier: string): IEdgeClassic | null {
        return this.allEdges.find(edge => edge?.id === edgeIdentifier);
    }

    findNodeIndexInAllNodes(nodeIdentifier: string): number | null {
        const index = this.allNodes.findIndex(node => node.id === nodeIdentifier);
        return (index < 0) ? null : index;
    }
    findEdgeIndexInAllEdges(edgeIdentifier: string): number | null {
        const index = this.allEdges.findIndex(edge => edge?.id === edgeIdentifier);
        return (index < 0) ? null : index;
    }

    resetForNewLayout(): void {
        this.allNodes.forEach(node => {
            node.isConsideredInLayout = true;
        });

        this.allEdges.forEach(edge => {
            edge.reverseInLayout = false;
            edge.isConsideredInLayout = true;
        })
    }

    convertWholeGraphToDataspecerRepresentation(): LayoutedVisualEntities {
        const visualEntities: LayoutedVisualEntities = {};

        for(const node of this.allNodes) {
            if(node.isDummy) {
                continue;
            }

            const visualEntityForNode = node.convertToDataspecerRepresentation();

            // visualEntities[node.id] = visualEntityForNode;           // TODO: In future these 2 lines should be equivalent
            visualEntities[visualEntityForNode.identifier] = {
                visualEntity: visualEntityForNode,
                isOutsider: node.completeVisualNode.isOutsider
            };
        }

        for(const edge of this.allEdges) {
            if(edge.isDummy) {
                continue;
            }

            const visualEntityForEdge = edge.convertToDataspecerRepresentation();
            // TODO: Just in case look-up if not set, but I think that in current version this never occurs, we always have the visual node to use
            if(visualEntityForEdge.visualSource === "") {
                const sourceGraphNode = this.findNodeInAllNodes(edge.start.id);
                visualEntityForEdge.visualSource = sourceGraphNode.completeVisualNode.coreVisualNode.identifier;
            }
            if(visualEntityForEdge.visualTarget === "") {
                const targetGraphNode = this.findNodeInAllNodes(edge.end.id);
                visualEntityForEdge.visualTarget = targetGraphNode.completeVisualNode.coreVisualNode.identifier;
            }
            // visualEntities[edge.id] = visualEntityForEdge;           // TODO: In future these 2 lines should be equivalent
            visualEntities[visualEntityForEdge.identifier] = {
                visualEntity: visualEntityForEdge,
                isOutsider: edge.visualEdge.isOutsider,
            };
        }

        return visualEntities;
    }
}



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

// TODO: Can create more specific interfaces for generalization, etc, which will be extending this one - they will be different in the fields - edge: type and isProfile value
export interface IEdgeClassic {
    /**
     * The graph in which the edge lies, this is relevant for example for ELK layouting library,
     * where the edges have to be stored within the relevant wrapper graph.
     */
    sourceGraph: IGraphClassic;

    // TODO: Document property
    sourceEntityModelIdentifier: string | null;

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


        let sourceEntityModelIdentifierForEdge: string | null = null;
        if(extractedModels !== null) {
            if(edgeToAddKey === "outgoingClassProfileEdges") {
                sourceEntityModelIdentifierForEdge = source.sourceEntityModelIdentifier ?? null;
            }
            else {
                sourceEntityModelIdentifierForEdge = extractedModels.entities
                    .find(entity => entity.semanticModelEntity.id === semanticEdge?.id)?.sourceEntityModelIdentifier ?? null;
            }
        }


        const edgeClassic: IEdgeClassic = new EdgeClassic(
            identifier, visualEdge, semanticEdge, edgeToAddKey, graph,
            source, target, sourceEntityModelIdentifierForEdge);
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
        sourceEntityModelIdentifier: string | null,
    ) {
        console.info("CREATING EDGE", this);

        sourceGraph.mainGraph.allEdges.push(this);
        this.sourceGraph = sourceGraph;
        this.isDummy = false;
        this.sourceEntityModelIdentifier = sourceEntityModelIdentifier;

        this.edgeProfileType = convertOutgoingEdgeTypeToEdgeProfileType(edgeType);
        this.edgeType = edgeType
        this.semanticEntityRepresentingEdge = semanticEdge;
        this.start = start;
        this.end = end;

        this.visualEdge = this.createVisualEdgeBasedOnData(visualRelationship, semanticEdge, sourceEntityModelIdentifier, start, end);
        this.id = identifier ?? this.visualEdge.visualEdge.identifier;

        if(semanticEdge === null) {
            addToRecordArray(this.id, this, sourceGraph.mainGraph.semanticEdgeToVisualMap);
        }
        else {
            addToRecordArray(semanticEdge.id, this, sourceGraph.mainGraph.semanticEdgeToVisualMap);
        }
    }

    sourceGraph: IGraphClassic;

    sourceEntityModelIdentifier: string | null;
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
        sourceEntityModelIdentifier: string | null,
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
                model: sourceEntityModelIdentifier ?? "",
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
            model: sourceEntityModelIdentifier ?? "",
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
        sourceEntityModelIdentifier: string | null,
        start: EdgeEndPoint,
        end: EdgeEndPoint,
    ): VisualEdge {
        if(visualRelationship !== null) {
            return new VisualEdge(visualRelationship, false);
        }
        else if(semanticEdge !== null) {
            const createdVisualRelationship = this.createNewVisualRelationshipBasedOnSemanticDataTODONEW(
                semanticEdge, sourceEntityModelIdentifier, start, end);
            return new VisualEdge(createdVisualRelationship, true);
        }
        else {
            return new VisualEdge(this.createNewVisualRelationshipBasedOnEndPoints(start, end), true);
        }
    }
}


const checkIfEdgeHasAtLeastOneOutsider = (outsiders: Record<string, XY | null>, start: string, end: string): boolean => {
    return outsiders[start] !== undefined || outsiders[end] !== undefined;
}

/**
 * @returns Returns true if either both ends are outsiders or at one is outsider and the other one is in visual model.
 */
const checkIfEdgeShouldBePartOfGraph = (
    visualModel: VisualModel,
    entitiesToLayout: VisualEntitiesWithOutsiders,
    start: string,
    end: string
): boolean => {
    return isNodeInVisualModel(visualModel, entitiesToLayout, null, start) &&
            isNodeInVisualModel(visualModel, entitiesToLayout, null, end);
}

/**
 * Interface which represents graph node ... Note that subgraph is also graph node.
 */
export interface INodeClassic {
    /**
     * Reference to the main graph, this node is part of.
     */
    mainGraph: IMainGraphClassic;
    /**
     *  We need {@link id}, because some nodes don't have equivalent in the semantic model or are dummy nodes
     */
    id: string;

    /**
     * is the SemanticModelEntity representing node.
     */
    semanticEntityRepresentingNode: SemanticModelEntity | null;
    isDummy: boolean;
    isMainEntity: boolean;
    isProfile: boolean;

    /**
     * It represents possible classes of which this node is profile of.
     */
    outgoingClassProfileEdges: Array<IEdgeClassic>;
    incomingClassProfileEdges: Array<IEdgeClassic>;

    isConsideredInLayout: boolean;

    layoutOptions: Record<string, string>;

    sourceEntityModelIdentifier: string | null;

    // TODO: I could actually have the following edges stored in Record/Map, where key would be the property name, so for example outgoingRelationshipEdges

    /**
     * The outgoing relationship edges, so the edges, where instance of this node is the source/start.
     */
    outgoingRelationshipEdges: Array<IEdgeClassic>;      // TODO: We are wasting a lot of space by doubling information by storing the edge reverses
    /**
     * The incoming relationship edges, so the edges, where instance of this node is the target/end.
     */
    incomingRelationshipEdges: Array<IEdgeClassic>;

    /**
     * The outgoing generalization edges, so the edges, where instance of this node is the child, i.e. source/start.
     */
    outgoingGeneralizationEdges: Array<IEdgeClassic>;
    /**
     * The incoming generalization edges, so the edges, where instance of this node is the parent, i.e. target/end.
     */
    incomingGeneralizationEdges: Array<IEdgeClassic>;

    /**
     * The outgoing profiled relationship edges, so the edges, where instance of this node is the source/start.
     */
    outgoingProfileEdges: Array<IEdgeClassic>;
    /**
     * The incoming profiled relationship edges, so the edges, where instance of this node is the target/end.
     */
    incomingProfileEdges: Array<IEdgeClassic>;

    /**
     * @returns Returns generator which can be iterated to get edges of all types, where the node is source/start.
     */
    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown>;
    /**
     * @returns Returns generator which can be iterated to get edges of all types, where the node is target/end.
     */
    getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown>;
    /**
     * @returns Returns generator which can be iterated to get edges of all types, where the node is either source or target.
     */
    getAllEdges(): Generator<IEdgeClassic, string, unknown>;

    /**
     * The complete visual entity for the node
     */
    completeVisualNode: IVisualNodeComplete;

    /**
     * Returns attributes of this node.
     */
    getAttributes(): SemanticModelRelationship[];

    /**
     * Returns the source graph of the node. So the subgraph where the node lies (the most inner one)
     */
    getSourceGraph(): IGraphClassic | null;
    /**
     * Sets the source graph of node to given {@link sourceGraph}
     */
    setSourceGraph(sourceGraph: IGraphClassic) : void;

    convertToDataspecerRepresentation(): VisualNode | null;

}

const getEdgeTypeNameFromEdge = (edge: IEdgeClassic): OutgoingEdgeType => {
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





function addNodeTODO(
    mainGraph: IMainGraphClassic,
    node: AllowedVisualsForNodes | null,
    semanticEntityRepresentingNode: SemanticModelEntity | null,
    isProfile: boolean,
    sourceEntityModelIdentifier: string | null,
    extractedModels: ExtractedModels,
    sourceGraph: IGraphClassic,
    visualModel: VisualModel,
    entitiesToLayout: VisualEntitiesWithOutsiders,
    explicititPosition: XY | null,
    explicitAnchors?: ExplicitAnchors): boolean {
    if(isNodeInVisualModel(visualModel, entitiesToLayout, node, semanticEntityRepresentingNode.id)) {
        new NodeClassic(
            mainGraph, node, semanticEntityRepresentingNode,
            isProfile, sourceEntityModelIdentifier,
            extractedModels, sourceGraph,
            explicititPosition, explicitAnchors);
        return true;
    }

    return false;
}


/**
 * The type which contains field names of the outgoing edges in {@link INodeClassic},
 * this is useful to minimize copy-paste of code, we just access the fields on node through node[key: OutgoingEdgeType].
 */
type OutgoingEdgeType = "outgoingRelationshipEdges" | "outgoingGeneralizationEdges" | "outgoingProfileEdges" | "outgoingClassProfileEdges";
type AllowedEdgeBundleWithType = {
    semanticRelationship: AllowedEdgeBundleTypes,
    type: OutgoingEdgeType,
};


/**
 * Same as {@link OutgoingEdgeType}, but for incoming edges.
 */
type IncomingEdgeType = "incomingRelationshipEdges" | "incomingGeneralizationEdges" | "incomingProfileEdges" | "incomingClassProfileEdges" ;

const convertOutgoingEdgeTypeToIncoming = (outgoingEdgeType: OutgoingEdgeType): IncomingEdgeType => {
    return "incoming" + capitalizeFirstLetter(outgoingEdgeType.slice("outgoing".length)) as IncomingEdgeType
};

export class NodeClassic implements INodeClassic {
    constructor(
        mainGraph: IMainGraphClassic,
        visualNode: AllowedVisualsForNodes | null,
        semanticEntityRepresentingNode: SemanticModelEntity | null,
        isProfile: boolean,
        sourceEntityModelIdentifier: string | null,
        extractedModels: ExtractedModels | null,
        sourceGraph: IGraphClassic,
        explicititPosition: XY | null,
        explicitAnchors?: ExplicitAnchors
    ) {
        this.mainGraph = mainGraph;
        this.sourceEntityModelIdentifier = sourceEntityModelIdentifier;

        this.sourceGraph = sourceGraph;
        this.semanticEntityRepresentingNode = semanticEntityRepresentingNode;
        this.isProfile = isProfile;

        if(extractedModels === null) {
            return;
        }


                // TODO: We don't really need the whole thing, we just need the attribute so storing the target of the relationship should be enough !
        //       But we store it all for now.
        this.attributes = extractedModels.attributes.filter(attributesBundle => {
            const {source, target, ...rest} = getEdgeSourceAndTargetRelationship(attributesBundle.semanticModelRelationship);
            return this.semanticEntityRepresentingNode.id === source;
        }).map(attributeBundle => attributeBundle.semanticModelRelationship);
        if(visualNode !== null) {
            this.id = visualNode.identifier;
            // Kind of ugly,
            // but the reason why need to do this is because the Reactflow dimension handlers, need the id.
        }
        const width = this.mainGraph.nodeDimensionQueryHandler.getWidth(this);
        const height = this.mainGraph.nodeDimensionQueryHandler.getHeight(this);

        const isOutsider = visualNode === null;
        if(visualNode === null) {
            let isAnchored = false;
            if(explicitAnchors !== undefined) {
                isAnchored = isEntityWithIdentifierAnchored(semanticEntityRepresentingNode.id, explicitAnchors, false);
            }
            const coreVisualNode = NodeClassic.createNewVisualNodeBasedOnSemanticData(
                explicititPosition, this.semanticEntityRepresentingNode.id, this.sourceEntityModelIdentifier);
            this.completeVisualNode = new VisualNodeComplete(coreVisualNode, width, height, false, isOutsider, isAnchored);
        }
        else {
            let isAnchored: boolean = visualNode.position.anchored ?? false;
            if(explicitAnchors !== undefined) {
                isAnchored = isEntityWithIdentifierAnchored(visualNode.identifier, explicitAnchors, isAnchored);
            }

            this.completeVisualNode = new VisualNodeComplete(visualNode, width, height, true, isOutsider, isAnchored);

            if(explicititPosition !== null) {
                this.completeVisualNode.coreVisualNode.position = {
                    ...explicititPosition,
                    anchored: this.completeVisualNode.coreVisualNode.position.anchored
                };
            }
        }
        this.id = this.completeVisualNode.coreVisualNode.identifier;

        sourceGraph.nodes[this.id] = this;
        mainGraph.allNodes.push(this);
        if(semanticEntityRepresentingNode === null) {
            addToRecordArray(this.id, this, this.mainGraph.semanticNodeToVisualMap);
        }
        else {
            addToRecordArray(semanticEntityRepresentingNode.id, this, this.mainGraph.semanticNodeToVisualMap);
        }

        console.info("Created node - constructor", this);
    }

    static createNewVisualNodeBasedOnSemanticData(
        position: XY | null,
        semanticEntityRepresentingNodeIdentifier: string,
        sourceEntityModelIdentifier: string | null
    ) {
        if(position === null) {
            position = {x: 0, y: 0};
        }
        return {
            identifier: Math.random().toString(36).substring(2),
            type: [VISUAL_NODE_TYPE],
            representedEntity: semanticEntityRepresentingNodeIdentifier,
            position: {
                x: position.x,
                y: position.y,
                anchored: null,
            },
            content: [],
            visualModels: [],
            model: sourceEntityModelIdentifier ?? "",
        };
    }

    getSourceGraph(): IGraphClassic {
        return this.sourceGraph;
    }

    setSourceGraph(sourceGraph: IGraphClassic): void {
        this.sourceGraph = sourceGraph;
    }
    getAttributes(): SemanticModelRelationship[] {
        return this.attributes;
    }

    convertToDataspecerRepresentation(): VisualNode | null {
        return this.completeVisualNode?.coreVisualNode ?? null;
    }

    mainGraph: IMainGraphClassic;
    sourceGraph: IGraphClassic;

    id: string;
    sourceEntityModelIdentifier: string | null;

    semanticEntityRepresentingNode: SemanticModelEntity | null;
    isDummy: boolean = false;       // TODO: For now just keep false
    isMainEntity: boolean = false;  // TODO: For now just keep false
    isProfile: boolean;

    completeVisualNode: IVisualNodeComplete;
    attributes: SemanticModelRelationship[];
    isConsideredInLayout: boolean = true;

    layoutOptions: Record<string, string> = {};

    outgoingClassProfileEdges: Array<IEdgeClassic> = [];
    incomingClassProfileEdges: Array<IEdgeClassic> = [];

    outgoingProfileEdges: IEdgeClassic[] = [];
    incomingProfileEdges: IEdgeClassic[] = [];

    outgoingGeneralizationEdges: IEdgeClassic[] = [];
    incomingGeneralizationEdges: IEdgeClassic[] = [];

    outgoingRelationshipEdges: IEdgeClassic[] = [];
    incomingRelationshipEdges: IEdgeClassic[] = [];
    getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown> {
        return getAllIncomingEdges(this);
    }

    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown> {
        return getAllOutgoingEdges(this);
    }

    getAllEdges(): Generator<IEdgeClassic, string, unknown> {
        return getAllEdges(this);
    }
}


/**
 * @returns Returns generator which can be iterated to get edges of all types, where {@link node} is target/end.
 */
function getAllIncomingEdges(node: INodeClassic): Generator<IEdgeClassic, string, unknown> {
    const internalGenerator = getEdgesInternal([node.incomingRelationshipEdges, node.incomingGeneralizationEdges, node.incomingProfileEdges, node.incomingClassProfileEdges]);
    return internalGenerator;
}


/**
 * @returns Returns generator which can be iterated to get edges of all types, where {@link node} is source/start.
 */
function getAllOutgoingEdges(node: INodeClassic): Generator<IEdgeClassic, string, unknown> {
    // Note: I couldn't find out, why can't I just somehow return the internals of the getEdgesInternal function
    // Answer: I just had to remove the * in front of method to say that it just returns the generator and isn't the generator in itself
    const internalGenerator = getEdgesInternal([node.outgoingRelationshipEdges, node.outgoingGeneralizationEdges, node.outgoingProfileEdges, node.outgoingClassProfileEdges]);
    return internalGenerator;
}

/**
 * Internal method to create generator from the given edges of different types.
 */
function *getEdgesInternal(edgesOfDifferentTypes: Array<Array<IEdgeClassic>>): Generator<IEdgeClassic, string, unknown> {
    for(const edgesOfOneType of edgesOfDifferentTypes) {
        // Note: Can't use forEach because of yield
        for(const e of edgesOfOneType) {
            yield e;
        }
    }

    return "TODO: End of generator";       // The actual value doesn't really matter, I just found it interesting that generator can return something different as last element
}

/**
 * @returns Returns generator which can be iterated to get edges, where {@link node} is either start or end.
 */
function *getAllEdges(node: INodeClassic): Generator<IEdgeClassic, string, unknown> {
    const incomingEdges = node.getAllIncomingEdges();
    const outgoingEdges = node.getAllOutgoingEdges();
    yield* incomingEdges;
    yield* outgoingEdges;

    return "TODO: End of both generators";
}
