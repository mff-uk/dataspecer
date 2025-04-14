import { isSemanticModelGeneralization, SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { EntitiesBundle, ExtractedModels, extractModelObjects, getEdgeSourceAndTargetGeneralization, getEdgeSourceAndTargetRelationship } from "./layout-iface.ts";

import { VisualModel, isVisualNode, Position, VisualEntity, VisualNode, VisualRelationship, isVisualRelationship, isVisualProfileRelationship, VisualProfileRelationship, VISUAL_PROFILE_RELATIONSHIP_TYPE, VISUAL_RELATIONSHIP_TYPE, VISUAL_NODE_TYPE } from "@dataspecer/core-v2/visual-model";
import { capitalizeFirstLetter, PhantomElementsFactory, placePositionOnGrid } from "./util/utils.ts";
import { LayoutedVisualEntity, LayoutedVisualEntities } from "./migration-to-cme-v2.ts";
import { EntityModel } from "@dataspecer/core-v2";
import { ExplicitAnchors, isEntityWithIdentifierAnchored } from "./explicit-anchors.ts";
import { NodeDimensionQueryHandler, ReactflowDimensionsEstimator, XY } from "./index.ts";
import { SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

type AllowedEdgeTypes = SemanticModelGeneralization |
                        SemanticModelRelationship |
                        SemanticModelRelationshipProfile |
                        null;

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


interface Graph {
    getNodes(): INode,
    filterNodes(filterFunction): INode,
    addNodes(nodes): boolean,
    removeNodes(nodes): boolean,
    addEdges(node, edges): boolean,
    putEdges(node, edges): boolean,
    getEdges(node): INode[],
    performActionOnNodes(action): void,
}

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

    constructor(coreVisualNode: VisualNode, width: number, height: number, useCopyOfCoreVisualNode: boolean, isOutsider: boolean, isAnchored?: boolean) {
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

/**
 * @deprecated
 */
export interface IGraphIncidence {
    nodes: Record<string, INode>,
    incidenceMatrix: Record<string, Record<string, IEdgeIncidence>>,
}

/**
 * @deprecated
 */
interface INode {
    index: number,
    node: SemanticModelEntity,
    isProfile: boolean,
}

/**
 * @deprecated
 */
interface IEdgeIncidence {
    isProfile: boolean,
    isGeneralization: boolean,
}


// It is probably just better to have Array<Array<IEdgeIncidence>> where IEdgeIncidence also has exists field
// and have somewhere next the mapping of the indices in array to the actual nodes, ie. Record<number, INode>, INode also doesn't need index then
// Such solution takes more memory (actual matrix), but I think it is much easier to use + the access should be a bit faster
/**
 * @deprecated Classical representation should be enough, there is probably no need for this one
 */
export class GraphIncidence implements IGraphIncidence {
    constructor(extractedModels: ExtractedModels) {
        // TODO: Again ... deprecated

        // let index: number = 0;
        // extractedModel.classes.forEach(cls => {
        //     this.nodes[cls.id] = {
        //         index: index, node: cls, isProfile: false
        //     }
        //     index++;
        // });
        // extractedModel.classesProfiles.forEach(cls => {
        //     this.nodes[cls.id] = {
        //         index: index, node: (cls as undefined as SemanticModelEntity), isProfile: true
        //     }
        //     index++;
        // });

        // extractedModel.relationships.forEach(r => {
        //     const {source, target, ...rest} = getEdgeSourceAndTargetRelationship(r);
        //     this.incidenceMatrix[source] = {};
        //     this.incidenceMatrix[source][target] = {isProfile: false, isGeneralization: false};
        // });

        // extractedModel.relationshipsProfiles.forEach(r => {
        //     const {source, target} = getEdgeSourceAndTargetRelationship(r);
        //     this.incidenceMatrix[source] = {};
        //     this.incidenceMatrix[source][target] = {isProfile: true, isGeneralization: true};
        // });

        // extractedModel.generalizations.forEach(g => {
        //     const {source, target} = getEdgeSourceAndTargetGeneralization(g);
        //     this.incidenceMatrix[source] = {};
        //     this.incidenceMatrix[source][target] = {isProfile: false, isGeneralization: true};
        // });
    }

    nodes: Record<string, INode> = {};
    incidenceMatrix: Record<string, Record<string, IEdgeIncidence>> ={};
}

// TODO: This doesn't really make sense, just have interface IGraph which represents any graph
//       (it will have only methods manipulating with it - addNode, ...), so something similiar to interface Graph (at top of the file)
/**
 * Interface which represents the (sub)graph,
 */
export interface IGraphClassic extends INodeClassic {
    nodes: Record<string, EdgeEndPoint>,
    initialize(mainGraph: IMainGraphClassic,
                sourceGraph: IGraphClassic,
                graphIdentifier: string,
                inputModels: Map<string, EntityModel> | ExtractedModels | null,
                nodeContentOfGraph: Array<EdgeEndPoint> | null,
                isDummy: boolean,
                visualModel: VisualModelWithOutsiders,
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
     * Creates graph, which is put into the {@link mainGraph}
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
    public static createGraph(mainGraph: IMainGraphClassic,
                                sourceGraph: IGraphClassic,
                                graphIdentifier: string,
                                inputModels: Map<string, EntityModel> | ExtractedModels | null,
                                nodeContentOfGraph: Array<EdgeEndPoint> | null,
                                isDummy: boolean,
                                visualModel: VisualModelWithOutsiders,
                                shouldSplitEdges: boolean,
                                explicitAnchors?: ExplicitAnchors): IGraphClassic {
        // Create subgraph which has given nodes as children (TODO: What if the nodes are not given, i.e. null?)
        const graph = new GraphClassic();
        graph.initialize(mainGraph, sourceGraph, graphIdentifier, inputModels, nodeContentOfGraph, isDummy, visualModel, null, explicitAnchors);
        sourceGraph.insertSubgraphToGraph(graph, nodeContentOfGraph, shouldSplitEdges);
        return graph;
    }


    /**
     * Creates instance of main graph. Main graph is like classic subgraph, but contains additional data about all the entities stored in graph.
     * TODO: Actually do I get any advantage by having additional type (except for saving space) and what starts happening when we have subgraphs inside subgraphs???
     */
    public static createMainGraph(graphIdentifier: string | null,
                                    inputModels: Map<string, EntityModel> | ExtractedModels | null,
                                    nodeContentOfGraph: Array<EdgeEndPoint> | null,
                                    visualModel: VisualModelWithOutsiders,
                                    nodeDimensionQueryHandler?: NodeDimensionQueryHandler | null,
                                    explicitAnchors?: ExplicitAnchors): IMainGraphClassic {
        if(graphIdentifier === null) {
            graphIdentifier = PhantomElementsFactory.createUniquePhanomNodeIdentifier();
        }
        const graph = new MainGraphClassic();
        graph.initialize(graph, graph, graphIdentifier, inputModels, nodeContentOfGraph, false, visualModel, nodeDimensionQueryHandler, explicitAnchors);
        return graph;
    }

}


/**
 * @returns Returns true if the relationship is inside the visual model or the model is null.
 */
const isRelationshipInVisualModel = (visualModel: VisualModelWithOutsiders,
                                    relationshipIdentifier: string,
                                    ends: [string, string]): boolean => {
    if(visualModel === null) {
        return true;
    }

    const isAtLeastOneEndOutsider = checkIfEdgeHasAtLeastOneOutsider(visualModel.outsiders, ends[0], ends[1]);
    const hasVisualInVisualmodel = visualModel.visualModel.hasVisualEntityForRepresented(relationshipIdentifier);
    const isPresentInVisualModel = hasVisualInVisualmodel || isAtLeastOneEndOutsider;
    return isPresentInVisualModel;
};


/**
 * @returns Returns true if the node is inside the visual model or if the model is null.
 */
const isNodeInVisualModel = (visualModel: VisualModelWithOutsiders,
                                nodeIdentifier: string): boolean => {
    if(visualModel === null) {
        return true;
    }

    // TODO: For now ... in future I should use the ids of visual model instead of the semantic ones
    const hasVisualInVisualmodel = visualModel.visualModel.hasVisualEntityForRepresented(nodeIdentifier);
    const isPresentInVisualModel = hasVisualInVisualmodel || visualModel?.outsiders[nodeIdentifier] !== undefined;
    return isPresentInVisualModel;
};


// TODO: Again something to probably change in cme-v2
/**
 * @returns Returns true if both ends of the generalization exists in the visual model
 */
const isGeneralizationInVisualModel = (visualModel: VisualModelWithOutsiders,
                                        generalization: SemanticModelGeneralization): boolean => {
    if(visualModel === null) {
        return true;
    }

    const isChildPresentInVisualModel = isNodeInVisualModel(visualModel, generalization.child);
    const isParentPresentInVisualModel = isNodeInVisualModel(visualModel, generalization.parent);
    return isChildPresentInVisualModel && isParentPresentInVisualModel;
};


/**
 * Class which stores (sub)graph.
 */
export class GraphClassic implements IGraphClassic {
    // TODO: the TODO in the name is because I have to change the API to contain just the methods and add it there
    addEdgeTODO(identifier: string | null, edge: AllowedEdgeTypes, target: string, isDummy: boolean, edgeToAddType: OutgoingEdgeType): IEdgeClassic | null {
        if(identifier === null) {
            identifier = PhantomElementsFactory.createUniquePhanomEdgeIdentifier();
        }

        // TODO: For now put it into sourceGraph - not sure if correct
        return addEdge(this.getSourceGraph(), identifier, edge, this, target, null, edgeToAddType, null);
    }

    /**
     * Initializes instance of this graph, the reason why this is not part of the constructor is that since {@link MainGraphClassic} extends this class,
     * it uses the same initialize method, that results in situation that we can't update the list of all nodes in the constructor, since they are not initialized.
     * TODO: Well if I will have only the MainGraph then I can have the constructor, there is no need to have separate initialize method.
     *
     * If {@link nodeContentOfGraph} is null then use that as the content of the graph, otherwise put in everything which is visible in {@link visualModel}, if that is also null
     * then everything which is part of {@link inputModel}.
     */
    initialize(mainGraph: IMainGraphClassic,
                sourceGraph: IGraphClassic,
                graphIdentifier: string,
                inputModels: Map<string, EntityModel> | ExtractedModels | null,
                nodeContentOfGraph: Array<EdgeEndPoint> | null,
                isDummy: boolean,
                visualModel: VisualModelWithOutsiders,
                nodeDimensionQueryHandler?: NodeDimensionQueryHandler | null,
                explicitAnchors?: ExplicitAnchors) {
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


        if(nodeContentOfGraph !== null) {
            const nodesMap = {};
            for(const node of nodeContentOfGraph) {
                nodesMap[node.node.id] = node;
                node.setSourceGraph(this);
            }
            this.nodes = nodesMap;
            return;
        }


        if(inputModels === null) {
            return;
        }

        // https://stackoverflow.com/questions/46703364/why-does-instanceof-in-typescript-give-me-the-error-foo-only-refers-to-a-ty
        // Just simple check, dont check all elements it is not necessary
        const areInputModelsExtractedModels = (inputModels as ExtractedModels).entities && (inputModels as ExtractedModels).generalizations;
        const extractedModels = areInputModelsExtractedModels ? (inputModels as ExtractedModels) : extractModelObjects(inputModels as Map<string, EntityModel>);


        console.info("extractedModels");
        console.info(extractedModels);

        extractedModels.classes.forEach(classBundle => {
            if(this.nodes[classBundle.semanticModelClass.id] === undefined) {
                this.addNode(classBundle.semanticModelClass, false, classBundle.sourceEntityModelIdentifier, extractedModels, visualModel, explicitAnchors);
            }
        });
        extractedModels.classesProfiles.forEach(cpBundle => {
            if(this.nodes[cpBundle.semanticModelClassProfile.id] === undefined) {
                this.addNode(cpBundle.semanticModelClassProfile, true, cpBundle.sourceEntityModelIdentifier, extractedModels, visualModel, explicitAnchors);
            }
        });


        // this.createGeneralizationSubgraphs(extractedModel.generalizations);
        // console.log("this.nodes");
        // console.log(this.nodes);
        // console.log("this");
        // console.log(this);
        // throw new Error("TODO: THE END");
    }

    /**
     * Adds node to this instance of graph. If visual model is not null, then the given node has to be visible in the visual model.
     */
    addNode(semanticEntityRepresentingNode: SemanticModelEntity,
            isProfile: boolean,
            sourceEntityModelIdentifier: string,
            extractedModels: ExtractedModels,
            visualModel: VisualModelWithOutsiders,
            explicitAnchors?: ExplicitAnchors): void {
        addNode(this.mainGraph, semanticEntityRepresentingNode, isProfile, sourceEntityModelIdentifier, extractedModels, this, visualModel, explicitAnchors);
    }

    private isEdgeInsideGraph(edge: IEdgeClassic): boolean {
        return edge.start.getSourceGraph() === this || edge.end.getSourceGraph() === this;
    }

    public createGeneralizationSubgraphs() {
        const generalizationEdges: SemanticModelGeneralization[] = [];
        this.mainGraph.allEdges.forEach(edge => {
            // TODO: Not sure if it actually has to be inside the graph or it can go beyond
            if(isSemanticModelGeneralization(edge.edge) && this.isEdgeInsideGraph(edge)) {
                generalizationEdges.push(edge.edge);
            }
        })

        // We pass in no visual model, since it is expected that the edges in the graph are exactly those which were at the visual model at the time of creation
        this.createGeneralizationSubgraphsInternal(generalizationEdges, null);
    }



    // TODO: Only reason why we need visualModel is because in the cme-v1 we can't easily tell if generalization is part of the visual model.
    /**
     * Creates generalization subgraphs. The subgraphs are maximal, meaning any node which can be reached through the generalization path is in the subgraph.
     */
    private createGeneralizationSubgraphsInternal(generalizationEdges: SemanticModelGeneralization[], visualModel: VisualModelWithOutsiders,): IGraphClassic[] {
        // For now 1 whole hierarchy (n levels) == 1 subgraph
        // TODO: Also very slow, but I will probably have my own graph representation later, in such case getting the generalization edges neighbors and
        // performing reachability search is trivial
        let parents: Record<string, string[]> = {};
        let children: Record<string, string[]> = {};
        generalizationEdges.forEach(g => {
            if(!isGeneralizationInVisualModel(visualModel, g)) {
                return;
            }
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
        let genSubgraphs: EdgeEndPoint[][] = subgraphs.map(subgraph => {
            // This removes the labels, so it is better to just paste in the original node
            // TODO: Or maybe the copy of it, but for now just paste in the original one
            // return subgraph.map(nodeID => this.createNode(nodeID, true));     // TODO: What about subgraphs inside subgraphs

            // TODO: Expects that that are no subgraphs in children
            return subgraph.map(nodeID => this.nodes[nodeID]);
        });

        console.log("Generated subgraphs:");
        console.log(subgraphs);
        console.log(genSubgraphs);
        // TODO: Just as in the relationships (in case of Schema.org) we have to remove the nodes which are not part of model
        // TODO: This is exactly the reason why I need to have my own graph representation as single source of truth - because here I am again
        //       removing nodes which shouldn't be in the graph in the first place, because I already removed them
        genSubgraphs = genSubgraphs.map(subgraph => subgraph.filter(n => n !== undefined));
        console.log(genSubgraphs);


        let createdSubgraphs: Array<IGraphClassic> = [];
        genSubgraphs.forEach(nodesInSubgraph => {
            createdSubgraphs.push(this.createGeneralizationSubgraphAndInsert(nodesInSubgraph));
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
    createGeneralizationSubgraphAndInsert(nodesInSubraph: Array<EdgeEndPoint>): IGraphClassic {
        const identifier = this.createUniqueGeneralizationSubgraphIdentifier();

        // TODO: Using the variable which I shouldnt use (the todoDebugExtractedModel)
        const subgraph: IGraphClassic = GraphFactory.createGraph(this.mainGraph, this, identifier, null, nodesInSubraph, true, null, true);
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
            delete this.nodes[nodeInSubgraph.node.id];
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


        addEdge(subgraph,
                firstSplitIdentifier,
                edge.edge,
                edge.start,
                subgraph.id,
                null,
                getEdgeTypeNameFromEdge(edge),
                null);
        addEdge(subgraph.getSourceGraph(),
                secondSplitIdentifier,
                edge.edge,
                subgraph,
                edge.end.id,
                null,
                getEdgeTypeNameFromEdge(edge),
                null);
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
    node: SemanticModelEntity | null = null;
    isDummy: boolean = true;
    isMainEntity: boolean = false;
    isProfile: boolean = false;
    isConsideredInLayout: boolean = true;     // TODO: Create setter/getter instead (iface vs class ... this will need change on lot of places)


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
    edge: AllowedEdgeTypes;
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
class EdgeClassic implements IEdgeClassic {
    constructor(
        id: string,
        edge: AllowedEdgeTypes,
        edgeType: OutgoingEdgeType,
        sourceGraph: IGraphClassic,
        start: EdgeEndPoint,
        end: EdgeEndPoint,
        sourceEntityModelIdentifier: string | null,
        visualModel: VisualModelWithOutsiders
    ) {
        this.id = id;
        sourceGraph.mainGraph.allEdges.push(this);
        this.sourceGraph = sourceGraph;
        this.isDummy = false;
        this.sourceEntityModelIdentifier = sourceEntityModelIdentifier;

        this.edgeProfileType = convertOutgoingEdgeTypeToEdgeProfileType(edgeType);
        this.edgeType = edgeType
        this.edge = edge;
        this.start = start;
        this.end = end;

        this.setVisualEdgeBasedOnStoredData(visualModel);
    }

    sourceGraph: IGraphClassic;

    sourceEntityModelIdentifier: string | null;
    id: string;
    edge: AllowedEdgeTypes;
    isDummy: boolean;
    edgeProfileType: EdgeProfileType;
    isConsideredInLayout: boolean = true;
    reverseInLayout: boolean = false;

    start: EdgeEndPoint;
    end: EdgeEndPoint;

    visualEdge: VisualEdge;

    edgeType: OutgoingEdgeType;

    convertToDataspecerRepresentation(): VisualRelationship | VisualProfileRelationship | null {
        return this.visualEdge.visualEdge;
    }


    private createNewVisualRelationshipBasedOnSemanticData(): VisualRelationship | VisualProfileRelationship {
        // TODO: It makes sense to use the cme methods to create the visual entities - Instead of implementing it all again - just define method and call it
        //      ... for example I am not sure the type should cotnain only the VISUAL_RELATIONSHIP_TYPE or also some other type, so for such cases constistency would be nice
        if(this.edgeProfileType === "CLASS-PROFILE") {
            const edgeToReturn: VisualProfileRelationship = {
                identifier: Math.random().toString(36).substring(2),
                entity: this.start.node.id,
                type: [VISUAL_PROFILE_RELATIONSHIP_TYPE],
                waypoints: [],
                model: this?.sourceEntityModelIdentifier ?? "",
                visualSource: this?.start?.completeVisualNode?.coreVisualNode?.identifier ?? "",
                visualTarget: this?.end?.completeVisualNode?.coreVisualNode?.identifier ?? "",
            };

            return edgeToReturn;
        }

        const edgeToReturn: VisualRelationship = {
            identifier: Math.random().toString(36).substring(2),
            type: [VISUAL_RELATIONSHIP_TYPE],
            representedRelationship: this?.edge?.id ?? this.id,
            waypoints: [],
            model: this?.sourceEntityModelIdentifier ?? "",
            visualSource: this?.start?.completeVisualNode?.coreVisualNode?.identifier ?? "",
            visualTarget: this?.end?.completeVisualNode?.coreVisualNode?.identifier ?? "",
        };

        return edgeToReturn;
    }


    /**
     * Either sets it to newly created visual edge or uses the one from visual model
     */
    private setVisualEdgeBasedOnStoredData(visualModel: VisualModelWithOutsiders) {
        this.visualEdge = null;
        if(visualModel !== null) {
            const isAtLeastOneEndOutsider = checkIfEdgeHasAtLeastOneOutsider(visualModel.outsiders, this.start.id, this.end.id);
            if(this.edgeType === "outgoingProfileEdges") {
                if(isAtLeastOneEndOutsider) {
                    this.visualEdge = new VisualEdge(this.createNewVisualRelationshipBasedOnSemanticData(), true);
                }
                else {
                    // TODO: Again the ID of semantic model instead of the visual one
                    // TODO RadStr: MULTI-ENTITIES!
                    const visualEntityForEdge = visualModel.visualModel.getVisualEntitiesForRepresented(this.id)[0];
                    if(isVisualRelationship(visualEntityForEdge)) {
                        this.visualEdge = new VisualEdge(visualEntityForEdge, false);
                    }
                }
            }
            else if(this.edgeType === "outgoingClassProfileEdges") {
                if(isAtLeastOneEndOutsider) {
                    this.visualEdge = new VisualEdge(this.createNewVisualRelationshipBasedOnSemanticData(), true);
                }
                else {
                    const visualEntityForEdge = [...visualModel.visualModel.getVisualEntities()].find(([visualEntityIdentifier, visualEntity]) => {
                        if(isVisualProfileRelationship(visualEntity)) {
                            return visualEntity.entity === this.start.id;
                        }
                        return false;
                    })?.[1];

                    if(isVisualProfileRelationship(visualEntityForEdge)) {
                        this.visualEdge = new VisualEdge(visualEntityForEdge, false);
                    }
                }
            }
            else {
                if(isAtLeastOneEndOutsider) {
                    this.visualEdge = new VisualEdge(this.createNewVisualRelationshipBasedOnSemanticData(), true);
                }
                else {
                    // TODO: Again the ID of semantic model instead of the visual one
                    // TODO RadStr: MULTI-ENTITIES!
                    const visualEntityForEdge = visualModel.visualModel.getVisualEntitiesForRepresented(this.id)[0];
                    if(isVisualRelationship(visualEntityForEdge)) {
                        this.visualEdge = new VisualEdge(visualEntityForEdge, false);
                    }
                }
            }
        }
        else {
            this.visualEdge = new VisualEdge(this.createNewVisualRelationshipBasedOnSemanticData(), false);
        }
    }
}


const checkIfEdgeHasAtLeastOneOutsider = (outsiders: Record<string, XY | null>, start: string, end: string): boolean => {
    return outsiders[start] !== undefined || outsiders[end] !== undefined;
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
    node: SemanticModelEntity | null;
    isDummy: boolean;
    isMainEntity: boolean;
    isProfile: boolean;
    setOutgoingClassProfileEdge(outgoingClassProfileEdge: IEdgeClassic);

    /**
     * It represents possible class of which this node is profile of.
     * This is either empty array or array with one element.
     * We used array for consistency with other types edges.
     * The actual value should be set using {@link setOutgoingClassProfileEdge}, but it actually doesn't really matter - TODO: So maybe just remove the set method
     */
    outgoingClassProfileEdges: Array<IEdgeClassic>;
    incomingClassProfileEdges: Array<IEdgeClassic>;

    isConsideredInLayout: boolean;

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
     * @returns Returns generator which can be iterated to get edges of all types, where {@link node} is source/start.
     */
    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown>;
    /**
     * @returns Returns generator which can be iterated to get edges of all types, where {@link node} is target/end.
     */
    getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown>;
    /**
     * @returns Returns generator which can be iterated to get edges of all types, where {@link node} is either source or target.
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

    /**
     * Adds new edge to the graph.
     * @returns the returned edge or null in case of failure
     */
    addEdgeTODO(identifier: string | null, edge: AllowedEdgeTypes, target: string, isDummy: boolean, edgeToAddType: OutgoingEdgeType): IEdgeClassic | null;
}

const getEdgeTypeNameFromEdge = (edge: IEdgeClassic): OutgoingEdgeType => {
    if(edge.edgeProfileType === "EDGE-PROFILE") {
        return "outgoingProfileEdges";
    }
    else if(edge.edgeProfileType === "CLASS-PROFILE") {
        return "outgoingClassProfileEdges"
    }
    else if(edge.edgeProfileType === "EDGE") {
        if(isSemanticModelGeneralization(edge.edge)) {
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
 * Adds node to {@link sourceGraph}. If visual model is not null, then the given node has to be visible in the visual model.
 */
function addNode(mainGraph: IMainGraphClassic,
                semanticEntityRepresentingNode: SemanticModelEntity,
                isProfile: boolean,
                sourceEntityModelIdentifier: string,
                extractedModels: ExtractedModels,
                sourceGraph: IGraphClassic,
                visualModel: VisualModelWithOutsiders,
                explicitAnchors?: ExplicitAnchors): boolean {
    if(isNodeInVisualModel(visualModel, semanticEntityRepresentingNode.id)) {
        sourceGraph.nodes[semanticEntityRepresentingNode.id] = new NodeClassic(mainGraph, semanticEntityRepresentingNode,
                                                                                isProfile, sourceEntityModelIdentifier,
                                                                                extractedModels, sourceGraph, visualModel,
                                                                                explicitAnchors);
        return true;
    }

    return false;
}


/**
 * Creates edge and inserts to the given {@link graph}, and the node ends.
 * If the {@link targetIdentifier} node of the edge doesn't exist in the main graph, it is created and added to the graph.
 */
function addEdge(graph: IGraphClassic,
                    id: string,
                    edge: AllowedEdgeTypes,
                    source: INodeClassic,
                    targetIdentifier: string,
                    extractedModels: ExtractedModels | null,
                    edgeToAddKey: OutgoingEdgeType,
                    visualModel: VisualModelWithOutsiders,
                    explicitAnchors?: ExplicitAnchors): IEdgeClassic | null {
    const reverseEdgeToAddKey: IncomingEdgeType = convertOutgoingEdgeTypeToIncoming(edgeToAddKey);
    console.log("Adding Edge to graph");
//    console.log(graph);
//    console.log(edge);
//    console.log(source);
//    console.log(targetIdentifier);
//    console.log(edgeToAddKey);
//    console.log(visualModel);

    const mainGraph = graph.mainGraph;
    let targetNode = mainGraph.allNodes.find(n => n.id === targetIdentifier);

    // console.log("targetNode");
    // console.log(targetNode);
    if(targetNode === undefined) {
        if(extractedModels === null) {
            return null;
        }
        const target: EntitiesBundle = extractedModels.entities.find(e => e.semanticModelEntity.id === targetIdentifier);
        if(target === undefined) {
            return null;
        }
        // TODO: Not ideal performance wise, using find 2 times

        // TODO: Just debug prints
        if(graph !== mainGraph) {
            console.info("Not Same");
            console.log(graph);
            console.log(edge);
            console.log(source);
            console.log(targetIdentifier);
            console.log(edgeToAddKey);
        }

        // TODO: Maybe sometimes the target node actually isn't part of the source graph of edge, but fix only if it occurs
        const nodeAdded = addNode(mainGraph, target.semanticModelEntity,
                                    extractedModels.classesProfiles.find(cpBundle => cpBundle.semanticModelClassProfile.id === targetIdentifier) !== undefined,
                                    target.sourceEntityModelIdentifier, extractedModels, graph, visualModel, explicitAnchors);
        if(nodeAdded === false) {
            return null;
        }

        targetNode = mainGraph.nodes[targetIdentifier];
    }


    // TODO: Maybe can get it from other place then extractedModels? - Can't think of anything better right now
    let sourceEntityModelIdentifierForEdge = null;
    if(extractedModels !== null) {
        if(edgeToAddKey === "outgoingClassProfileEdges") {
            sourceEntityModelIdentifierForEdge = extractedModels.entities.find(entity => entity.semanticModelEntity.id === source.node.id).sourceEntityModelIdentifier;
        }
        else {
            sourceEntityModelIdentifierForEdge = extractedModels.entities.find(entity => entity.semanticModelEntity.id === id).sourceEntityModelIdentifier;
        }
    }


    const edgeClassic: IEdgeClassic = new EdgeClassic(id, edge, edgeToAddKey, graph, source, targetNode, sourceEntityModelIdentifierForEdge, visualModel);
    // TODO: The reverse edge shouldn't be put in the list of all edges.

    // const reverseEdgeClassic: IEdgeClassic = new EdgeClassic(id, edge, edgeToAddKey === "profileEdges", graph, targetNode, source);
    const reverseEdgeClassic: IEdgeClassic = edgeClassic;

    if(edgeToAddKey === "outgoingClassProfileEdges") {
        source.setOutgoingClassProfileEdge(edgeClassic);     // TODO: No need to separate we could use the else branch
    }
    else {
        source[edgeToAddKey].push(edgeClassic);
    }
    targetNode[reverseEdgeToAddKey].push(reverseEdgeClassic);

    return edgeClassic
}


/**
 * The type which contains field names of the outgoing edges in {@link INodeClassic},
 * this is useful to minimize copy-paste of code, we just access the fields on node through node[key: OutgoingEdgeType].
 */
type OutgoingEdgeType = "outgoingRelationshipEdges" | "outgoingGeneralizationEdges" | "outgoingProfileEdges" | "outgoingClassProfileEdges";


/**
 * Same as {@link OutgoingEdgeType}, but for incoming edges.
 */
type IncomingEdgeType = "incomingRelationshipEdges" | "incomingGeneralizationEdges" | "incomingProfileEdges" | "incomingClassProfileEdges" ;

const convertOutgoingEdgeTypeToIncoming = (outgoingEdgeType: OutgoingEdgeType): IncomingEdgeType => {
    return "incoming" + capitalizeFirstLetter(outgoingEdgeType.slice("outgoing".length)) as IncomingEdgeType
};

class NodeClassic implements INodeClassic {
    constructor(mainGraph: IMainGraphClassic,
                semanticEntityRepresentingNode: SemanticModelEntity,
                isProfile: boolean,
                sourceEntityModelIdentifier: string | null,
                extractedModels: ExtractedModels | null,
                sourceGraph: IGraphClassic,
                visualModel: VisualModelWithOutsiders,
                explicitAnchors?: ExplicitAnchors) {
        mainGraph.allNodes.push(this);
        this.mainGraph = mainGraph;
        this.id = semanticEntityRepresentingNode.id;
        this.sourceEntityModelIdentifier = sourceEntityModelIdentifier;

        this.sourceGraph = sourceGraph;
        sourceGraph.nodes[semanticEntityRepresentingNode.id] = this;
        this.node = semanticEntityRepresentingNode;
        this.isProfile = isProfile;

        if(extractedModels === null) {
            return;
        }



        // TODO: We don't really need the whole thing, we just need the attribute so storing the target of the relationship should be enough !
        //       But we store it all for now.
        this.attributes = extractedModels.attributes.filter(attributesBundle => {
            const {source, target, ...rest} = getEdgeSourceAndTargetRelationship(attributesBundle.semanticModelRelationship);
            return this.node.id === source;
        }).map(attributeBundle => attributeBundle.semanticModelRelationship);

        // Notice that we need to set the attributes first to correctly estimate the width/height of node if necessary.
        const width = this.mainGraph.nodeDimensionQueryHandler.getWidth(this);
        const height = this.mainGraph.nodeDimensionQueryHandler.getHeight(this);
        if(visualModel !== null) {
            const outsiderPosition = visualModel.outsiders[this.node.id];
            if(outsiderPosition !== undefined) {
                // We have to create new visual node, since it is outsider,
                // that means - it isn't present in visual model
                const coreVisualNode = this.createNewVisualNodeBasedOnSemanticData(outsiderPosition);
                let isAnchored = false;
                if(explicitAnchors !== undefined) {
                    isAnchored = isEntityWithIdentifierAnchored(this.node.id, explicitAnchors, isAnchored);
                }
                this.completeVisualNode = new VisualNodeComplete(coreVisualNode, width, height, false, true, isAnchored);
            }
            else {
                // TODO: What should happen once we have 1 represented entity on canvas twice ... then we will also need different ID in this.id
                // TODO RadStr: MULTI-ENTITIES!
                const visualNode = visualModel.visualModel.getVisualEntitiesForRepresented(this.node.id)[0];
                if(!isVisualNode(visualNode)) {
                    throw new Error("Something is very wrong, visual node isn't of type visual node");
                }

                // Just expect that anchors work on top of visual model (It really isn't much of a limitation)
                let isAnchored: boolean = visualNode.position.anchored ?? false;
                if(explicitAnchors !== undefined) {
                    isAnchored = isEntityWithIdentifierAnchored(this.id, explicitAnchors, isAnchored);
                }

                this.completeVisualNode = new VisualNodeComplete(visualNode, width, height, true, false, isAnchored);
            }

        }
        else {
            const coreVisualNode = this.createNewVisualNodeBasedOnSemanticData(null);
            // Here we don't check for explicit anchors, since it doesn't make sense to use them, because in this case we don't have position or anything
            // Basically we are just layouting semantic model.
            this.completeVisualNode = new VisualNodeComplete(coreVisualNode, width, height, false, false, false);
        }

        let edgeToAddKey: OutgoingEdgeType = "outgoingRelationshipEdges";
        extractedModels.relationships.forEach(rBundle => {
            const {source, target, ...rest} = getEdgeSourceAndTargetRelationship(rBundle.semanticModelRelationship);
            if(semanticEntityRepresentingNode.id === source) {
                if(isRelationshipInVisualModel(visualModel, rBundle.semanticModelRelationship.id, [source, target])) {
                    this.addEdge(sourceGraph, rBundle.semanticModelRelationship.id, rBundle.semanticModelRelationship, target, extractedModels, edgeToAddKey, visualModel, explicitAnchors);
                }
            }
        });

        edgeToAddKey = "outgoingGeneralizationEdges";
        extractedModels.generalizations.forEach(gBundle => {
            const {source, target} = getEdgeSourceAndTargetGeneralization(gBundle.semanticModelGeneralization);
            if(semanticEntityRepresentingNode.id === source) {
                if(isGeneralizationInVisualModel(visualModel, gBundle.semanticModelGeneralization)) {
                    this.addEdge(sourceGraph, gBundle.semanticModelGeneralization.id, gBundle.semanticModelGeneralization, target, extractedModels, edgeToAddKey, visualModel, explicitAnchors);
                }
            }
        });

        edgeToAddKey = "outgoingProfileEdges";
        extractedModels.relationshipsProfiles.forEach(rpBundle => {
            const {source, target} = getEdgeSourceAndTargetRelationship(rpBundle.semanticModelRelationshipProfile);
            if(semanticEntityRepresentingNode.id === source) {
                if(isRelationshipInVisualModel(visualModel, rpBundle.semanticModelRelationshipProfile.id, [source, target])) {
                    this.addEdge(sourceGraph, rpBundle.semanticModelRelationshipProfile.id, rpBundle.semanticModelRelationshipProfile, target, extractedModels, edgeToAddKey, visualModel, explicitAnchors);
                }
            }
        });

        // TODO: For now, in future I would like to separate it from the profile edges, since maybe I would like to perform specific operations on profiles
        //       Merge into one node, layout the whole graph, split into original nodes and layout only the profiles
        edgeToAddKey = "outgoingClassProfileEdges";
        extractedModels.classesProfiles.forEach(cpBundle => {
            if(cpBundle.semanticModelClassProfile.id === semanticEntityRepresentingNode.id) {
                for(const profileOf of cpBundle.semanticModelClassProfile.profiling) {
                    if(isNodeInVisualModel(visualModel, profileOf)) {
                        // TODO: Nothing new but again using "semantic" edge id instead of the visual one
                        const edgeIdentifier = cpBundle.semanticModelClassProfile.id + "-profile-" + profileOf;
                        this.addEdge(sourceGraph, edgeIdentifier, null, profileOf, extractedModels, edgeToAddKey, visualModel, explicitAnchors);
                    }
                }
            }
        });
    }

    private createNewVisualNodeBasedOnSemanticData(position: XY | null) {
        if(position === null) {
            position = {x: 0, y: 0};
        }
        return {
            identifier: Math.random().toString(36).substring(2),
            type: [VISUAL_NODE_TYPE],
            representedEntity: this.node.id,
            position: {
                x: position.x,
                y: position.y,
                anchored: null,
            },
            content: [],
            visualModels: [],
            model: this.sourceEntityModelIdentifier ?? "",
        };
    }


    addEdgeTODO(identifier: string | null, edge: AllowedEdgeTypes, target: string, isDummy: boolean, edgeToAddType: OutgoingEdgeType): IEdgeClassic | null {
        if(identifier === null) {
            identifier = PhantomElementsFactory.createUniquePhanomEdgeIdentifier();
        }

        return this.addEdge(this.getSourceGraph(), identifier, edge, target, null, edgeToAddType, null);
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

    addEdge(graph: IGraphClassic,
            identifier: string,
            edge: AllowedEdgeTypes,
            target: string,
            extractedModels: ExtractedModels,
            edgeToAddKey: OutgoingEdgeType,
            visualModel: VisualModelWithOutsiders,
            explicitAnchors?: ExplicitAnchors): IEdgeClassic | null {
        return addEdge(graph, identifier, edge, this, target, extractedModels, edgeToAddKey, visualModel, explicitAnchors);
        // const reverseEdgeToAddKey: ReverseAddEdgeType = "reverse" + capitalizeFirstLetter(edgeToAddKey) as ReverseAddEdgeType;
        // if(graph.nodes[target] === undefined) {
        //     // TODO: I think that the issue with scheme.org is generalization which has node http://www.w3.org/2000/01/rdf-schema#Class but it isn't in the model
        //     // At least I hope it isn't some bigger issue between DataType and rdf-schema
        //     const targetEntity: SemanticModelEntity = extractedModel.entities.find(e => e.id === target);
        //     if(targetEntity === undefined) {
        //         return;
        //     }
        //     // TODO: Not ideal performance wise, using find 2 times
        //     graph.nodes[target] = new NodeClassic(targetEntity,
        //                                           extractedModel.classesProfiles.find(cp => cp.id === target) !== undefined,
        //                                           extractedModel, graph);
        // }

        // const edgeClassic: IEdgeClassic = new EdgeClassic(edge, edgeToAddKey === "profileEdges", graph, this, graph.nodes[target]);
        // const reverseEdgeClassic: IEdgeClassic = new EdgeClassic(edge, edgeToAddKey === "profileEdges", graph, graph.nodes[target], this);

        // this[edgeToAddKey].push(edgeClassic);
        // graph.nodes[target][reverseEdgeToAddKey].push(reverseEdgeClassic);
    }

    convertToDataspecerRepresentation(): VisualNode | null {
        return this.completeVisualNode?.coreVisualNode ?? null;
    }

    mainGraph: IMainGraphClassic;
    sourceGraph: IGraphClassic;

    id: string;
    sourceEntityModelIdentifier: string | null;

    node: SemanticModelEntity;
    isDummy: boolean = false;       // TODO: For now just keep false
    isMainEntity: boolean = false;  // TODO: For now just keep false
    isProfile: boolean;

    setOutgoingClassProfileEdge(outgoingClassProfileEdge: IEdgeClassic) {
        this.isProfile = true;
        this.outgoingClassProfileEdges = [outgoingClassProfileEdge];
    }

    completeVisualNode: IVisualNodeComplete;     // TODO:
    attributes: SemanticModelRelationship[];
    isConsideredInLayout: boolean = true;

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
