import { isSemanticModelGeneralization, SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ExtractedModel, extractModelObjects, getEdgeSourceAndTargetGeneralization, getEdgeSourceAndTargetRelationship, getEdgeSourceAndTargetRelationshipUsage } from "./layout-iface";

import { VisualEntity, VisualEntityModel } from "@dataspecer/core-v2/visual-model";
import { Position, VisualEntities } from "../../core-v2/lib/visual-model/visual-entity";
import { capitalizeFirstLetter, PhantomElementsFactory } from "./util/utils";


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
 * Represents visual entity as in the cme visual model, but with 2 additional fields - {@link width} and {@link height}
 */
export interface IVisualEntityComplete {
    coreVisualEntity: VisualEntity,
    width: number,
    height: number,
}

export class VisualEntityComplete implements IVisualEntityComplete {
    coreVisualEntity: VisualEntity;
    width: number;
    height: number;

    constructor(coreVisualEntity: VisualEntity, width: number, height: number) {
        this.coreVisualEntity = coreVisualEntity;
        this.width = width;
        this.height = height;
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
    constructor(extractedModel: ExtractedModel) {
        let index: number = 0;
        extractedModel.classes.forEach(cls => {
            this.nodes[cls.id] = {
                index: index, node: cls, isProfile: false
            }
            index++;
        });
        extractedModel.classesProfiles.forEach(cls => {
            this.nodes[cls.id] = {
                index: index, node: (cls as undefined as SemanticModelEntity), isProfile: true
            }
            index++;
        });

        extractedModel.relationships.forEach(r => {
            const {source, target, ...rest} = getEdgeSourceAndTargetRelationship(r);
            this.incidenceMatrix[source] = {};
            this.incidenceMatrix[source][target] = {isProfile: false, isGeneralization: false};
        });

        extractedModel.relationshipsProfiles.forEach(r => {
            const {source, target} = getEdgeSourceAndTargetRelationshipUsage(r);
            this.incidenceMatrix[source] = {};
            this.incidenceMatrix[source][target] = {isProfile: true, isGeneralization: true};
        });

        extractedModel.generalizations.forEach(g => {
            const {source, target} = getEdgeSourceAndTargetGeneralization(g);
            this.incidenceMatrix[source] = {};
            this.incidenceMatrix[source][target] = {isProfile: false, isGeneralization: true};
        });
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
    todoDebugExtractedModel: ExtractedModel,
    initialize(mainGraph: IMainGraphClassic,
                sourceGraph: IGraphClassic,
                graphIdentifier: string,
                inputModel: Record<string, SemanticModelEntity> | ExtractedModel | null,
                nodeContentOfGraph: Array<EdgeEndPoint> | null,
                isDummy: boolean,
                visualModel: VisualEntityModel | null),
    insertSubgraphToGraph(subgraph: IGraphClassic, nodesInSubgraph: Array<EdgeEndPoint>, shouldSplitEdges: boolean): void,
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

    // TODO: Maybe map to make it faster
    findNodeInAllNodes(nodeIdentifier: string): EdgeEndPoint | null,
    findEdgeInAllEdges(edgeIdentifier: string): IEdgeClassic | null,
    findNodeIndexInAllNodes(nodeIdentifier: string): number | null,
    findEdgeIndexInAllEdges(edgeIdentifier: string): number | null,
    /**
     * Call this method on the "wrapper" graph to convert all entities within the graph to VisualEntites which can be used in Visual model
     */
    convertWholeGraphToDataspecerRepresentation(): VisualEntities,
    /**
     * This method goes through all the nodes, subgraphs and edges inside this graph and sets properties modifying graph to default state - mainly {@link isConsideredInLayout} and reverseInLayout on edges
     */
    resetForNewLayout(): void,
}


/**
 * Factory class to create graphs with.
 */
export class GraphFactory {
    /**
     * Creates graph, which is put into the {@link mainGraph}
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
                                inputModel: Record<string, SemanticModelEntity> | ExtractedModel,
                                nodeContentOfGraph: Array<EdgeEndPoint> | null,
                                isDummy: boolean,
                                visualModel: VisualEntityModel | null,
                                shouldSplitEdges: boolean): IGraphClassic {
        // Create subgraph which has given nodes as children (TODO: What if the nodes are not given, i.e. null?)
        const graph = new GraphClassic();
        graph.initialize(mainGraph, sourceGraph, graphIdentifier, inputModel, nodeContentOfGraph, isDummy, visualModel);
        sourceGraph.insertSubgraphToGraph(graph, nodeContentOfGraph, shouldSplitEdges);
        return graph;
    }


    /**
     * Creates instance of main graph. Main graph is like classic subgraph, but contains additional data about all the entities stored in graph.
     * TODO: Actually do I get any advantage by having additional type (except for saving space) and what starts happening when we have subgraphs inside subgraphs???
     */
    public static createMainGraph(graphIdentifier: string | null,
                                    inputModel: Record<string, SemanticModelEntity> | ExtractedModel | null,
                                    nodeContentOfGraph: Array<EdgeEndPoint> | null,
                                    visualModel: VisualEntityModel | null): IMainGraphClassic {
        if(graphIdentifier === null) {
            graphIdentifier = PhantomElementsFactory.createUniquePhanomNodeIdentifier();
        }
        const graph = new MainGraphClassic();
        graph.initialize(graph, graph, graphIdentifier, inputModel, nodeContentOfGraph, false, visualModel);
        return graph;
    }

}


// TODO: Have to solve separately since in the cme-v1 this holds:
//       unless specified that the relationship is not visible or there are not both ends, it is visible by default
/**
 * @returns Returns true if the relationship is inside the visual model or the model is null.
 */
const isRelationshipInVisualModel = (visualModel: VisualEntityModel | null,
                                    visualEntities: Map<string, VisualEntity> | undefined,
                                    relationshipIdentifier: string,
                                    ends: [string, string]): boolean => {
    const visualEntity = visualEntities?.get(relationshipIdentifier);
    const areEndsInVisualModel = isNodeInVisualModel(visualModel, visualEntities, ends[0]) && isNodeInVisualModel(visualModel, visualEntities, ends[1]);
    return visualModel === null || ((visualEntity === undefined || visualEntity.visible === true) && areEndsInVisualModel);
};


/**
 * @returns Returns true if the node is inside the visual model or if the model is null.
 */
const isNodeInVisualModel = (visualModel: VisualEntityModel | null,
                                visualEntities: Map<string, VisualEntity> | undefined,
                                nodeIdentifier: string): boolean => {
    const visualEntity = visualEntities?.get(nodeIdentifier);
    return visualModel === null || (visualEntity !== undefined && visualEntity.visible === true);
};


// TODO: Again something to probably change in cme-v2
/**
 * @returns Returns true if both ends of the generalization exists in the visual model
 */
const isGeneralizationInVisualModel = (visualModel: VisualEntityModel | null,
                                        visualEntities: Map<string, VisualEntity> | undefined,
                                        generalization: SemanticModelGeneralization): boolean => {
    const visualEntityChild = visualEntities?.get(generalization.child);
    const visualEntityParent = visualEntities?.get(generalization.parent);
    return (visualModel === null) ||
                (visualEntityChild !== undefined && visualEntityChild.visible === true &&
                 visualEntityParent !== undefined && visualEntityParent.visible === true);
};


/**
 * Class which stores (sub)graph.
 */
export class GraphClassic implements IGraphClassic {

    // TODO: the TODO in the name is because I have to change the API to contain just the methods and add it there
    addEdgeTODO(identifier: string | null, edge: SemanticModelEntity | null, target: string, isDummy: boolean, edgeToAddType: OutgoingEdgeType): IEdgeClassic | null {
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
                inputModel: Record<string, SemanticModelEntity> | ExtractedModel | null,
                nodeContentOfGraph: Array<EdgeEndPoint> | null,
                isDummy: boolean,
                visualModel: VisualEntityModel | null) {
        this.sourceGraph = sourceGraph;
        if(!(this instanceof MainGraphClassic)) {
            mainGraph.allNodes.push(this);
        }
        this.mainGraph = mainGraph;
        this.id = graphIdentifier;
        this.isDummy = isDummy;


        if(nodeContentOfGraph !== null) {
            const nodesMap = {};
            for(const node of nodeContentOfGraph) {
                nodesMap[node.node.id] = node;
                node.setSourceGraph(this);
            }
            this.nodes = nodesMap;
            return;
        }


        if(inputModel === null) {
            return;
        }

        // https://stackoverflow.com/questions/46703364/why-does-instanceof-in-typescript-give-me-the-error-foo-only-refers-to-a-ty
        // Just simple check, dont check all elements it is not necessary
        const isExtractedModel = (inputModel as ExtractedModel).entities && (inputModel as ExtractedModel).generalizations;
        const extractedModel = isExtractedModel ? (inputModel as ExtractedModel) : extractModelObjects(inputModel as Record<string, SemanticModelEntity>);
        this.todoDebugExtractedModel = extractedModel;



        extractedModel.classes.forEach(c => {
            if(this.nodes[c.id] === undefined) {
                this.addNode(c, false, extractedModel, visualModel);
            }
        });
        extractedModel.classesProfiles.forEach(cp => {
            if(this.nodes[cp.id] === undefined) {
                this.addNode(cp, true, extractedModel, visualModel);
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
            extractedModel: ExtractedModel,
            visualModel: VisualEntityModel | null): void {
        addNode(this.mainGraph, semanticEntityRepresentingNode, isProfile, extractedModel, this, visualModel)
    }

    public createGeneralizationSubgraphsFromStoredTODOExtractedModel(visualModel: VisualEntityModel | null) {
        this.createGeneralizationSubgraphs(this.todoDebugExtractedModel.generalizations, visualModel);
    }


    // TODO: Only reason why we need visualModel is because in the cme-v1 we can't easily tell if generalization is part of the visual model.
    /**
     * Creates generalization subgraphs. The subgraphs are maximal, meaning any node which can be reached through the generalization path is in the subgraph.
     */
    public createGeneralizationSubgraphs(generalizationEdges: SemanticModelGeneralization[], visualModel: VisualEntityModel | null): IGraphClassic[] {
        // For now 1 whole hierarchy (n levels) == 1 subgraph
        // TODO: Also very slow, but I will probably have my own graph representation later, in such case getting the generalization edges neighbors and
        // performing reachability search is trivial
        let parents: Record<string, string[]> = {};
        let children: Record<string, string[]> = {};
        const visualEntities = visualModel?.getVisualEntities();
        generalizationEdges.forEach(g => {
            if(!isGeneralizationInVisualModel(visualModel, visualEntities, g)) {
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
        const subgraph: IGraphClassic = GraphFactory.createGraph(this.mainGraph, this, identifier, this.todoDebugExtractedModel, nodesInSubraph, true, null, true);
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
                this.todoDebugExtractedModel,
                getEdgeTypeNameFromEdge(edge),
                null);
        addEdge(subgraph.getSourceGraph(),
                secondSplitIdentifier,
                edge.edge,
                subgraph,
                edge.end.id,
                this.todoDebugExtractedModel,
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


    convertToDataspecerRepresentation(): VisualEntity {
        return this.completeVisualEntity.coreVisualEntity;
    }


    nodes: Record<string, EdgeEndPoint> = {};
    todoDebugExtractedModel: ExtractedModel;


    sourceGraph: IGraphClassic;
    mainGraph: IMainGraphClassic;

    id: string = "";
    node: SemanticModelEntity | null = null;
    isDummy: boolean = true;
    isMainEntity: boolean = false;
    isProfile: boolean = false;
    isConsideredInLayout: boolean = true;     // TODO: Create setter/getter instead (iface vs class ... this will need change on lot of places)

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

    completeVisualEntity: IVisualEntityComplete;

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

    convertWholeGraphToDataspecerRepresentation(): VisualEntities {
        const visualEntities: VisualEntities = {};

        for(const node of this.allNodes) {
            if(node.isDummy) {
                continue;
            }

            const visualEntityForNode = node.convertToDataspecerRepresentation();
            visualEntities[node.id] = visualEntityForNode;
        }

        // TODO: Wait for Visual-model v2
        // for(const edge of this.allEdges) {
        //     if(edge.isDummy) {
        //         continue;
        //     }

        //     const visualEntityForNode = edge.convertToDataspecerRepresentation();
        //     visualEntities[edge.id] = visualEntityForNode;
        // }

        return visualEntities;
    }
}



/**
 * Possible edge point is either node or another subgraph.
 */
export type EdgeEndPoint = INodeClassic | IGraphClassic;

// TODO: Can create more specific interfaces for generalization, etc, which will be extending this one - they will be different in the fields - edge: type and isProfile value
export interface IEdgeClassic {
    /**
     * The graph in which the edge lies, this is relevant for example for ELK layouting library, 
     * where the edges have to be stored within the relevant wrapper graph.
     */
    sourceGraph: IGraphClassic,

    /**
     * Identifier of the edge, can be different from the edge id, for example when splitting ... TODO: Actually should I use the id of the semantic entity or of the visual one as origin??
     */
    id: string,                 // TODO: A lot of this data is same for class/edge/graph so it should be in separate interface/class
    /**
     * is the edge in the semantic model or null.
     */
    edge: SemanticModelEntity | null,
    /**
     * If true, then it is dummy edge which doesn't exist in the semantic model.
     */
    isDummy: boolean,
    /**
     * If the edge represents profile edge ... TODO: Probably will be enum because of the class profile edges
     */
    isProfile: boolean,
    /**
     * If true then this edge is part of the layouted graph, therefore it should be considered, otherwise it is not considered in layouting.
     */
    isConsideredInLayout: boolean,
    /**
     * If true then the direction of this edge is reversed in the layouting algorithm
     */
    reverseInLayout: boolean,

    /**
     * Represents the source from which the edge goes.
     */
    start: EdgeEndPoint,
    /**
     * Represents the target from which the edge goes.
     */
    end: EdgeEndPoint,

    // TODO: Actually will just have visual entity in cme-v2 for this - similiar to nodes
    waypoints: Position[],

    /**
     * Converts the edge into visual entity which can be used in the visual model.
     */
    convertToDataspecerRepresentation(): VisualEntity;
}


/**
 * Represents the graph edge.
 */
class EdgeClassic implements IEdgeClassic {
    constructor(id: string, edge: SemanticModelEntity | null, isProfile: boolean, sourceGraph: IGraphClassic, start: EdgeEndPoint, end: EdgeEndPoint) {
        this.id = id;
        sourceGraph.mainGraph.allEdges.push(this);
        this.sourceGraph = sourceGraph;
        this.isDummy = false;

        this.isProfile = isProfile;
        this.edge = edge;
        this.start = start;
        this.end = end;
    }

    sourceGraph: IGraphClassic;

    id: string;
    edge: SemanticModelEntity | null;
    isDummy: boolean;
    isProfile: boolean;
    isConsideredInLayout: boolean = true;
    reverseInLayout: boolean = false;

    start: EdgeEndPoint;
    end: EdgeEndPoint;

    waypoints: Position[];

    convertToDataspecerRepresentation(): VisualEntity {
        throw new Error("Method not implemented.");
    }
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
    isConsideredInLayout: boolean;

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
    completeVisualEntity: IVisualEntityComplete;

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

    convertToDataspecerRepresentation(): VisualEntity;

    /**
     * Adds new edge to the graph.
     * @returns the returned edge or null in case of failure
     */
    addEdgeTODO(identifier: string | null, edge: SemanticModelEntity | null, target: string, isDummy: boolean, edgeToAddType: OutgoingEdgeType): IEdgeClassic | null;
}

const getEdgeTypeNameFromEdge = (edge: IEdgeClassic): OutgoingEdgeType => {
    if(edge.isProfile) {
        return "outgoingProfileEdges";
    }
    else if(isSemanticModelGeneralization(edge.edge)) {
        return "outgoingGeneralizationEdges";
    }
    else {
        return "outgoingRelationshipEdges";
    }
}



/**
 * Adds node to {@link sourceGraph}. If visual model is not null, then the given node has to be visible in the visual model.
 */
function addNode(mainGraph: IMainGraphClassic,
                semanticEntityRepresentingNode: SemanticModelEntity,
                isProfile: boolean,
                extractedModel: ExtractedModel,
                sourceGraph: IGraphClassic,
                visualModel: VisualEntityModel | null): boolean {
    const visualEntities = visualModel?.getVisualEntities();
    if(isNodeInVisualModel(visualModel, visualEntities, semanticEntityRepresentingNode.id)) {
        sourceGraph.nodes[semanticEntityRepresentingNode.id] = new NodeClassic(mainGraph, semanticEntityRepresentingNode, isProfile, extractedModel, sourceGraph, visualModel);
        return true;
    }

    return false;
}


/**
 * Creates edge and inserts to the given {@link graph}, and the node ends. 
 * If the {@link target} node of the edge doesn't exist in the main graph, it is created and added to the graph.
 */
function addEdge(graph: IGraphClassic,
                    id: string,
                    edge: SemanticModelEntity | null,
                    source: INodeClassic,
                    target: string,
                    extractedModel: ExtractedModel | null,
                    edgeToAddKey: OutgoingEdgeType,
                    visualModel: VisualEntityModel | null): IEdgeClassic | null {
    const reverseEdgeToAddKey: IncomingEdgeType = convertOutgoingEdgeTypeToIncoming(edgeToAddKey);
    console.log("Adding Edge to graph");
    // console.log(target);
    // console.log(edge);
    // console.log(graph);
    // console.log(edge);
    // console.log(source);
    // console.log(target);
    // console.log(edgeToAddKey);

    const mainGraph = graph.mainGraph;
    let targetNode = mainGraph.allNodes.find(n => n.id === target);

    // console.log("targetNode");
    // console.log(targetNode);
    if(targetNode === undefined) {
        if(extractedModel === null) {
            return null;
        }
        const targetEntity: SemanticModelEntity = extractedModel.entities.find(e => e.id === target);
        if(targetEntity === undefined) {
            return null;
        }
        // TODO: Not ideal performance wise, using find 2 times

        if(graph !== mainGraph) {
            console.info("Not Same");
            console.log(graph);
            console.log(edge);
            console.log(source);
            console.log(target);
            console.log(edgeToAddKey);
        }

        // TODO: Maybe sometimes the target node actually isn't part of the source graph of edge, but fix only if it occurs
        const nodeAdded = addNode(mainGraph, targetEntity, extractedModel.classesProfiles.find(cp => cp.id === target) !== undefined,
                                    extractedModel, graph, visualModel);
        if(nodeAdded === false) {
            return null;
        }

        targetNode = mainGraph.nodes[target];
    }


    const edgeClassic: IEdgeClassic = new EdgeClassic(id, edge, edgeToAddKey === "outgoingProfileEdges", graph, source, targetNode);
    // TODO: The reverse edge shouldn't be put in the list of all edges.

    // const reverseEdgeClassic: IEdgeClassic = new EdgeClassic(id, edge, edgeToAddKey === "profileEdges", graph, targetNode, source);
    const reverseEdgeClassic: IEdgeClassic = edgeClassic;

    source[edgeToAddKey].push(edgeClassic);
    targetNode[reverseEdgeToAddKey].push(reverseEdgeClassic);

    return edgeClassic
}


/**
 * The type which contains field names of the outgoing edges in {@link INodeClassic},
 * this is useful to minimize copy-paste of code, we just access the fields on node through node[key: OutgoingEdgeType].
 */
type OutgoingEdgeType = "outgoingRelationshipEdges" | "outgoingGeneralizationEdges" | "outgoingProfileEdges";


/**
 * Same as {@link OutgoingEdgeType}, but for incoming edges.
 */
type IncomingEdgeType = "incomingRelationshipEdges" | "incomingGeneralizationEdges" | "incomingProfileEdges";

const convertOutgoingEdgeTypeToIncoming = (outgoingEdgeType: OutgoingEdgeType): IncomingEdgeType => "incoming" + capitalizeFirstLetter(outgoingEdgeType.slice("outgoing".length)) as IncomingEdgeType;

class NodeClassic implements INodeClassic {
    constructor(mainGraph: IMainGraphClassic,
                    semanticEntityRepresentingNode: SemanticModelEntity,
                    isProfile: boolean,
                    extractedModel: ExtractedModel | null,
                    sourceGraph: IGraphClassic,
                    visualModel: VisualEntityModel | null) {
        mainGraph.allNodes.push(this);
        this.mainGraph = mainGraph;
        this.id = semanticEntityRepresentingNode.id;

        this.sourceGraph = sourceGraph;
        sourceGraph.nodes[semanticEntityRepresentingNode.id] = this;
        this.node = semanticEntityRepresentingNode;
        this.isProfile = isProfile;

        if(extractedModel === null) {
            return;
        }

        if(visualModel !== null) {
            this.completeVisualEntity = {
                coreVisualEntity: {...visualModel.getVisualEntity(this.id)},
                // TODO: Maybe also set width/height?
                width: 0,
                height: 0,
            };

        }

        const visualEntities = visualModel?.getVisualEntities();

        let edgeToAddKey: OutgoingEdgeType = "outgoingRelationshipEdges";
        extractedModel.relationships.forEach(r => {
            const {source, target, ...rest} = getEdgeSourceAndTargetRelationship(r);
            if(semanticEntityRepresentingNode.id === source) {
                if(isRelationshipInVisualModel(visualModel, visualEntities, r.id, [source, target])) {
                    this.addEdge(sourceGraph, r.id, r, target, extractedModel, edgeToAddKey, visualModel);
                }
            }
        });

        edgeToAddKey = "outgoingGeneralizationEdges";
        extractedModel.generalizations.forEach(g => {
            const {source, target} = getEdgeSourceAndTargetGeneralization(g);
            if(semanticEntityRepresentingNode.id === source) {
                if(isGeneralizationInVisualModel(visualModel, visualEntities, g)) {
                    this.addEdge(sourceGraph, g.id, g, target, extractedModel, edgeToAddKey, visualModel);
                }
            }
        });

        edgeToAddKey = "outgoingProfileEdges";
        extractedModel.relationshipsProfiles.forEach(rp => {
            const {source, target} = getEdgeSourceAndTargetRelationshipUsage(rp);
            if(semanticEntityRepresentingNode.id === source) {
                if(isRelationshipInVisualModel(visualModel, visualEntities, rp.id, [source, target])) {
                    this.addEdge(sourceGraph, rp.id, rp, target, extractedModel, edgeToAddKey, visualModel);
                }
            }
        });

        // TODO: For now, in future I would like to separate it from the profile edges, since maybe I would like to perform specific operations on profiles
        //       Merge into one node, layout the whole graph, split into original nodes and layout only the profiles
        edgeToAddKey = "outgoingProfileEdges";
        extractedModel.classesProfiles.forEach(cp => {
            if(cp.id === semanticEntityRepresentingNode.id) {
                if(isNodeInVisualModel(visualModel, visualEntities, cp.usageOf)) {
                    const edgeIdentifier = cp.id + "-profile-" + cp.usageOf;
                    this.addEdge(sourceGraph, edgeIdentifier, null, cp.usageOf, extractedModel, edgeToAddKey, visualModel);
                }
            }
        });

        // TODO: We don't really need the whole thing, we just need the attribute so storing the target of the relationship should be enough !
        this.attributes = extractedModel.attributes.filter(a => {
            const {source, target, ...rest} = getEdgeSourceAndTargetRelationship(a);
            return this.node.id === source;
        });
    }
    addEdgeTODO(identifier: string | null, edge: SemanticModelEntity | null, target: string, isDummy: boolean, edgeToAddType: OutgoingEdgeType): IEdgeClassic | null {
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
            edge: SemanticModelEntity | null,
            target: string,
            extractedModel: ExtractedModel,
            edgeToAddKey: OutgoingEdgeType,
            visualModel: VisualEntityModel | null): IEdgeClassic | null {
        return addEdge(graph, identifier, edge, this, target, extractedModel, edgeToAddKey, visualModel);
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

    convertToDataspecerRepresentation(): VisualEntity {
        return this.completeVisualEntity.coreVisualEntity;
    }

    mainGraph: IMainGraphClassic;
    sourceGraph: IGraphClassic;

    id: string;

    node: SemanticModelEntity;
    isDummy: boolean = false;       // TODO: For now just keep false
    isMainEntity: boolean = false;  // TODO: For now just keep false
    isProfile: boolean;
    completeVisualEntity: IVisualEntityComplete;     // TODO:
    attributes: SemanticModelRelationship[];
    isConsideredInLayout: boolean = true;

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
    const internalGenerator = getEdgesInternal([node.incomingRelationshipEdges, node.incomingGeneralizationEdges, node.incomingProfileEdges]);
    return internalGenerator;
}


/**
 * @returns Returns generator which can be iterated to get edges of all types, where {@link node} is source/start.
 */
function getAllOutgoingEdges(node: INodeClassic): Generator<IEdgeClassic, string, unknown> {
    // Note: I couldn't find out, why can't I just somehow return the internals of the getEdgesInternal function
    // Answer: I just had to remove the * in front of method to say that it just returns the generator and isn't the generator in itself
    const internalGenerator = getEdgesInternal([node.outgoingRelationshipEdges, node.outgoingGeneralizationEdges, node.outgoingProfileEdges]);
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
