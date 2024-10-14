import { isSemanticModelGeneralization, SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ExtractedModel, extractModelObjects, getEdgeSourceAndTargetGeneralization, getEdgeSourceAndTargetRelationship, getEdgeSourceAndTargetRelationshipUsage } from "./layout-iface";

import { VisualEntity, VisualEntityModel } from "@dataspecer/core-v2/visual-model";
import { Position, VisualEntities } from "../../core-v2/lib/visual-model/visual-entity";
import { capitalizeFirstLetter, PhantomElementsFactory } from "./util/utils";
import { EntityModel } from "@dataspecer/core-v2";

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

// TODO: Remove later, was just testing typing in typescript
export interface IGraphIncidenceConstructor {
    new(extractedModel: ExtractedModel): IGraphIncidence
}

export interface IGraphIncidence {
    nodes: Record<string, INode>,
    incidenceMatrix: Record<string, Record<string, IEdgeIncidence>>,
}

// TODO: Remove later, was just testing typing in typescript
interface INodeConstructor {
    new(node: SemanticModelClass | SemanticModelClassUsage): INode
}

interface INode {
    index: number,
    node: SemanticModelEntity,
    isProfile: boolean,
}

interface IEdgeIncidence {
    isProfile: boolean,
    isGeneralization: boolean,
}


// It is probably just better to have Array<Array<IEdgeIncidence>> where IEdgeIncidence also has exists field
// and have somewhere next the mapping of the indices in array to the actual nodes, ie. Record<number, INode>, INode also doesn't need index then
// Such solution takes more memory (actual matrix), but I think it is much easier to use + the access should be a bit faster
// That being said the classical representation should be enough, there is probably no need for this one
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
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(r);
            this.incidenceMatrix[source] = {};
            this.incidenceMatrix[source][target] = {isProfile: false, isGeneralization: false};
        });

        extractedModel.relationshipsProfiles.forEach(r => {
            const [source, target] = getEdgeSourceAndTargetRelationshipUsage(r);
            this.incidenceMatrix[source] = {};
            this.incidenceMatrix[source][target] = {isProfile: true, isGeneralization: true};
        });

        extractedModel.generalizations.forEach(g => {
            const [source, target] = getEdgeSourceAndTargetGeneralization(g);
            this.incidenceMatrix[source] = {};
            this.incidenceMatrix[source][target] = {isProfile: false, isGeneralization: true};
        });
    }

    nodes: Record<string, INode> = {};
    incidenceMatrix: Record<string, Record<string, IEdgeIncidence>> ={};
}

// TODO: This doesn't really make sense, just have interface IGraph which represents any graph
//       (it will have only methods manipulating with it - addNode, ...)
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
    allNodes: EdgeEndPoint[],
    allEdges: IEdgeClassic[],       // TODO: Kdyz uz mam tyhle edges, tak to potencionalne muzu mit jako mapu a v ramci tech nodu si jen pamatovat ID misto celych objektu, ale je to celkem jedno
                                    //       (+ tohle pak nebude pole, respektvie bych si ho musel ziskavat skrz Object.values)

    // TODO: Maybe map to make it faster
    findNodeInAllNodes(nodeIdentifier: string): EdgeEndPoint | null,
    findEdgeInAllEdges(edgeIdentifier: string): IEdgeClassic | null,
    findNodeIndexInAllNodes(nodeIdentifier: string): number | null,
    findEdgeIndexInAllEdges(edgeIdentifier: string): number | null,
    convertWholeGraphToDataspecerRepresentation(): VisualEntities,
}

export class GraphFactory {
    public static createGraph(mainGraph: IMainGraphClassic,
                                sourceGraph: IGraphClassic,
                                graphIdentifier: string,
                                inputModel: Record<string, SemanticModelEntity> | ExtractedModel,
                                nodeContentOfGraph: Array<EdgeEndPoint> | null,
                                isDummy: boolean,
                                visualModel: VisualEntityModel | null): IGraphClassic {
        const graph = new GraphClassic();
        graph.initialize(mainGraph, sourceGraph, graphIdentifier, inputModel, nodeContentOfGraph, isDummy, visualModel);
        return graph;
    }

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


export class GraphClassic implements IGraphClassic {
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


        const visualEntities = visualModel?.getVisualEntities();


        extractedModel.classes.forEach(c => {
            if(this.nodes[c.id] === undefined) {
                // TODO: Similiar code to this is on multiple places ... the check against visual model and optional addition to graph
                const visualEntity = visualEntities?.get(c.id);
                if(visualModel === null || (visualEntity !== undefined && visualEntity.visible === true)) {
                    this.nodes[c.id] = new NodeClassic(this.mainGraph, c, false, extractedModel, this, visualModel);
                }
            }
        });
        extractedModel.classesProfiles.forEach(cp => {
            if(this.nodes[cp.id] === undefined) {
                const visualEntity = visualEntities?.get(cp.id);
                if(visualModel === null || (visualEntity !== undefined && visualEntity.visible === true)) {
                    // TODO: Careful, if I somehow lose (or don't check) the isProfile info stored inside the node, then I can access the iri, which profiles don't have
                    this.nodes[cp.id] = new NodeClassic(this.mainGraph, cp as undefined as SemanticModelClass, true, extractedModel, this, visualModel);
                }
            }
        });


        // this.createGeneralizationSubgraphs(extractedModel.generalizations);
        // console.log("this.nodes");
        // console.log(this.nodes);
        // console.log("this");
        // console.log(this);
        // throw new Error("TODO: THE END");
    }

    public addNode(semanticEntityRepresentingNode: SemanticModelEntity,
                    isProfile: boolean,
                    extractedModel: ExtractedModel,
                    visualModel: VisualEntityModel | null): void {
        this.nodes[semanticEntityRepresentingNode.id] = new NodeClassic(this.mainGraph, semanticEntityRepresentingNode, isProfile, extractedModel, this, visualModel);
    }

    public createGeneralizationSubgraphsFromStoredTODOExtractedModel(visualModel: VisualEntityModel | null) {
        this.createGeneralizationSubgraphs(this.todoDebugExtractedModel.generalizations, visualModel);
    }


    public createGeneralizationSubgraphs(generalizationEdges: SemanticModelGeneralization[], visualModel: VisualEntityModel | null) {
        // For now 1 whole hierarchy (n levels) == 1 subgraph
        // TODO: Also very slow, but I will probably have my own graph representation later, in such case getting the generalization edges neighbors and
        // performing reachability search is trivial
        let parents: Record<string, string[]> = {};
        let children: Record<string, string[]> = {};
        const visualEntities = visualModel?.getVisualEntities();
        generalizationEdges.forEach(g => {
            // TODO: Again same code for checking visibility on multiple places
            const visualEntityChild = visualEntities?.get(g.child);
            const visualEntityParent = visualEntities?.get(g.parent);
            if(!((visualModel === null) ||
                 (visualEntityChild !== undefined && visualEntityChild.visible === true && visualEntityParent !== undefined && visualEntityParent.visible === true))) {
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


        let createdSubgraphs: Array<EdgeEndPoint> = [];
        genSubgraphs.forEach(subg => {
            createdSubgraphs.push(this.createSubgraphAndInsert(subg));
        });


        return createdSubgraphs;
    }


    findGeneralizationSubgraphs(parents: Record<string, string[]>, children: Record<string, string[]>): string[][] {
        let subgraphs: Record<string, number> = {};
        let stack: string[] = [];
        let currSubgraph = -1;

        for(let [child, concreteParents] of Object.entries(parents)) {
            if(subgraphs[child] === undefined) {
                currSubgraph++;
                stack.push(child);
                subgraphs[stack[0]] = currSubgraph;
                // TODO: Can't import assert, but that doesn't really matter
                // assert(stack[0] === child, "Incorrect assumption about empty stack in DFS");
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

    createSubgraphAndInsert(subgraphNodes: Array<EdgeEndPoint>): IGraphClassic {
        const identifier = this.createUniqueGeneralizationSubgraphIdentifier();

        // 1) Take ElkNodes and create one subgraph which has them as children
        // TODO: Using the variable which I shouldnt use (the todoDebugExtractedModel)
        const subgraph: IGraphClassic = GraphFactory.createGraph(this.mainGraph, this, identifier, this.todoDebugExtractedModel, subgraphNodes, true, null);
        // 2) Repair the old graph by substituting the newly created subgraph from 1), while doing that also repair edges by splitting them into two parts
        //    (part inside subgraph and outside)
        this.insertSubgraphToGraph(subgraph, subgraphNodes);
        return subgraph;
    }

    insertSubgraphToGraph(subgraph: IGraphClassic, subgraphNodes: Array<EdgeEndPoint>): void {
        this.changeNodesInOriginalGraph(subgraph, subgraphNodes);
        console.log("After changeNodesInOriginalGraph");
        this.repairEdgesInOriginalGraph(subgraph, subgraphNodes);
        console.log("After repairEdgesInOriginalGraph");
    }

    changeNodesInOriginalGraph(subgraph: IGraphClassic, subgraphNodes: Array<EdgeEndPoint>) : void {
        for(const subgraphNode of subgraphNodes) {
            delete this.nodes[subgraphNode.node.id];
        }
        this.nodes[subgraph.id] = subgraph;
    }

    repairEdgesInOriginalGraph(subgraph: IGraphClassic, changedNodes: Array<EdgeEndPoint>) : void {
        this.repairEdgesGoingBeyondSubgraph(subgraph, changedNodes);
    }

    repairEdgesGoingBeyondSubgraph(subgraph: IGraphClassic, changedNodes: Array<EdgeEndPoint>) {
        this.repairEdgesGoingBeyondSubgraphInternal(subgraph, changedNodes, "sources");
        this.repairEdgesGoingBeyondSubgraphInternal(subgraph, changedNodes, "targets");
    }


    /**
     *
     * @param graph
     * @param subgraph
     * @param changedNodes
     * @param edgeEnd is either "sources" or "targets", if it is sources then it repairs edges going out of subgraph, "targets" then going in
     */
    private repairEdgesGoingBeyondSubgraphInternal(subgraph: IGraphClassic, changedNodes: Array<EdgeEndPoint>, edgeEnd: "sources" | "targets") {
        console.log("START OF repairEdgesGoingBeyondSubgraphInternal");

        const edgesGoingBeyond: IEdgeClassic[] = [];

        const nodesInsideSubgraph = changedNodes.concat(subgraph);
        if(edgeEnd === "sources") {
            changedNodes.forEach(node => {
                for(const edge of node.getAllOutgoingEdges()) {
                    if(nodesInsideSubgraph.find(changedNode => changedNode.id === edge.end.id) === undefined) {
                        edgesGoingBeyond.push(edge);
                    }
                }
            });
        }
        else if(edgeEnd === "targets") {
            changedNodes.forEach(node => {
                for(const edge of node.getAllIncomingEdges()) {
                    if(nodesInsideSubgraph.find(changedNode => changedNode.id === edge.start.id) === undefined) {
                        edgesGoingBeyond.push(edge);
                    }
                }
            });
        }

        console.log("BEFORE GOING TO splitEdgeIntoTwo")

        // TODO: Actually ... should visual model contain ports?? And should I have them here in my representation????!!!
        edgesGoingBeyond.forEach(e => this.splitEdgeIntoTwo(e, subgraph, edgeEnd));
    }

    splitEdgeIntoTwo(edge: IEdgeClassic, subgraph: IGraphClassic, edgeEnd: "sources" | "targets"): void {
        let relevantEnd: "start" | "end";
        let targetNode: EdgeEndPoint;           // TODO: Rename - bad name
        let oppositeEdge: IEdgeClassic;

        if(edgeEnd === "sources") {
            relevantEnd = "end";
            targetNode = edge.end;
            oppositeEdge = [...targetNode.getAllIncomingEdges()].find(e => e.id === edge.id);
        }
        else {
            relevantEnd = "start";
            targetNode = edge.start;
            oppositeEdge = [...targetNode.getAllOutgoingEdges()].find(e => e.id === edge.id);
        }
        const oppositeEnd: "start" | "end" = relevantEnd === "start" ? "end" : "start";

        this.removeEdgeFromNode(edge);
        const firstSplitIdentifier = PhantomElementsFactory.constructSplitID(edge.id, 0);
        const secondSplitIdentifier = PhantomElementsFactory.constructSplitID(edge.id, 1);




        addEdge(subgraph,
                firstSplitIdentifier,
                edge.edge,
                edge.start,
                subgraph.id,
                this.todoDebugExtractedModel,
                getAddEdgeTypeFromEdge(edge),
                null);
        addEdge(subgraph.getSourceGraph(),
                secondSplitIdentifier,
                edge.edge,
                subgraph,
                edge.end.id,
                this.todoDebugExtractedModel,
                getAddEdgeTypeFromEdge(edge),
                null);
    }

    removeEdgeFromNode(edge: IEdgeClassic) {
        const edgeType = getAddEdgeTypeFromEdge(edge);
        const reverseEdgeType = reverseAddEdgeType(edgeType);

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

    profileEdges: Array<IEdgeClassic> = [];      // TODO: We are wasting a lot of space by doubling information
    reverseRelationshipEdges: Array<IEdgeClassic> = [];

    generalizationEdges: Array<IEdgeClassic> = [];
    reverseGeneralizationEdges: Array<IEdgeClassic> = [];

    relationshipEdges: Array<IEdgeClassic> = [];
    reverseProfileEdges: Array<IEdgeClassic> = [];
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
        return this.allEdges.find(edge => edge?.edge?.id === edgeIdentifier);
    }

    findNodeIndexInAllNodes(nodeIdentifier: string): number | null {
        const index = this.allNodes.findIndex(node => node.id === nodeIdentifier);
        return (index < 0) ? null : index;
    }
    findEdgeIndexInAllEdges(edgeIdentifier: string): number | null {
        const index = this.allEdges.findIndex(edge => edge?.edge?.id === edgeIdentifier);
        return (index < 0) ? null : index;
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




type EdgeEndPoint = INodeClassic | IGraphClassic;

// TODO: Can create more specific interfaces for generalization, etc, which will be extending this one - they will be different in the fields - edge: type and isProfile value
export interface IEdgeClassic {
    sourceGraph: IGraphClassic,

    id: string,
    edge: SemanticModelEntity,
    isDummy: boolean,
    isProfile: boolean,

    start: EdgeEndPoint,
    end: EdgeEndPoint,

    waypoints: Position[],

    convertToDataspecerRepresentation(): VisualEntity;
}


class EdgeClassic implements IEdgeClassic {
    constructor(id: string, edge: SemanticModelEntity, isProfile: boolean, sourceGraph: IGraphClassic, start: EdgeEndPoint, end: EdgeEndPoint) {
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
    edge: SemanticModelEntity;
    isDummy: boolean;
    isProfile: boolean;

    start: EdgeEndPoint;
    end: EdgeEndPoint;

    waypoints: Position[];

    convertToDataspecerRepresentation(): VisualEntity {
        throw new Error("Method not implemented.");
    }
}

export interface INodeClassic {
    mainGraph: IMainGraphClassic;
    id: string,         // We need id, because some nodes don't have equivalent in the semantic model or are dummy nodes

    node: SemanticModelEntity | null,
    isDummy: boolean,
    isMainEntity: boolean,
    isProfile: boolean,

    profileEdges: Array<IEdgeClassic>,      // TODO: We are wasting a lot of space by doubling information
    reverseRelationshipEdges: Array<IEdgeClassic>,

    generalizationEdges: Array<IEdgeClassic>,
    reverseGeneralizationEdges: Array<IEdgeClassic>,

    relationshipEdges: Array<IEdgeClassic>,
    reverseProfileEdges: Array<IEdgeClassic>,
    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown>,
    getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown>,
    getAllEdges(): Generator<IEdgeClassic, string, unknown>,

    completeVisualEntity: IVisualEntityComplete,

    getAttributes(): SemanticModelRelationship[];
    getSourceGraph(): IGraphClassic | null;
    setSourceGraph(sourceGraph: IGraphClassic) : void;

    convertToDataspecerRepresentation(): VisualEntity,
}

const getAddEdgeTypeFromEdge = (edge: IEdgeClassic): AddEdgeType => {
    if(edge.isProfile) {
        return "profileEdges";
    }
    else if(isSemanticModelGeneralization(edge.edge)) {
        return "generalizationEdges";
    }
    else {
        return "relationshipEdges";
    }
}

function addEdge(graph: IGraphClassic,
                    id: string,
                    edge: SemanticModelEntity,
                    source: INodeClassic,
                    target: string,
                    extractedModel: ExtractedModel,
                    edgeToAddKey: AddEdgeType,
                    visualModel: VisualEntityModel | null) {
    const reverseEdgeToAddKey: ReverseAddEdgeType = reverseAddEdgeType(edgeToAddKey);
    console.log("Adding Edge to graph")
    console.log(graph);
    console.log(edge);
    console.log(source);
    console.log(target);
    console.log(edgeToAddKey);

    const mainGraph = graph.mainGraph;
    let targetNode = mainGraph.allNodes.find(n => n.id === target);

    console.log("targetNode");
    console.log(targetNode);
    if(targetNode === undefined) {
        // TODO: I think that the issue with scheme.org is generalization which has node http://www.w3.org/2000/01/rdf-schema#Class but it isn't in the model
        // At least I hope it isn't some bigger issue between DataType and rdf-schema
        const targetEntity: SemanticModelEntity = extractedModel.entities.find(e => e.id === target);
        if(targetEntity === undefined) {
            return;
        }
        // TODO: Not ideal performance wise, using find 2 times
        mainGraph.nodes[target] = new NodeClassic(mainGraph, targetEntity,
                                                    extractedModel.classesProfiles.find(cp => cp.id === target) !== undefined,
                                                    extractedModel, graph,
                                                    visualModel);
        targetNode = mainGraph.nodes[target];
    }


    const edgeClassic: IEdgeClassic = new EdgeClassic(id, edge, edgeToAddKey === "profileEdges", graph, source, targetNode);
    // TODO: The reverse edge shouldn't be put in the list of all edges.

    // const reverseEdgeClassic: IEdgeClassic = new EdgeClassic(id, edge, edgeToAddKey === "profileEdges", graph, targetNode, source);
    const reverseEdgeClassic: IEdgeClassic = edgeClassic;

    source[edgeToAddKey].push(edgeClassic);
    targetNode[reverseEdgeToAddKey].push(reverseEdgeClassic);
}

type AddEdgeType = "relationshipEdges" | "generalizationEdges" | "profileEdges";
type ReverseAddEdgeType = "reverseRelationshipEdges" | "reverseGeneralizationEdges" | "reverseProfileEdges";

const reverseAddEdgeType = (addEdgeType: AddEdgeType): ReverseAddEdgeType => "reverse" + capitalizeFirstLetter(addEdgeType) as ReverseAddEdgeType;

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

        const visualEntities = visualModel?.getVisualEntities();

        let edgeToAddKey: AddEdgeType = "relationshipEdges"
        extractedModel.relationships.forEach(r => {
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(r);
            if(semanticEntityRepresentingNode.id === source) {
                const visualEntity = visualEntities?.get(r.id);
                if(visualModel === null || (visualEntity !== undefined && visualEntity.visible === true)) {
                    this.addEdge(sourceGraph, r.id, r, target, extractedModel, edgeToAddKey, visualModel);
                }
            }
        });

        edgeToAddKey = "generalizationEdges"
        extractedModel.generalizations.forEach(g => {
            const [source, target] = getEdgeSourceAndTargetGeneralization(g);
            if(semanticEntityRepresentingNode.id === source) {
                const visualEntityChild = visualEntities?.get(g.child);
                const visualEntityParent = visualEntities?.get(g.parent);
                if((visualModel === null) ||
                        (visualEntityChild !== undefined && visualEntityChild.visible === true &&
                         visualEntityParent !== undefined && visualEntityParent.visible === true)) {
                    this.addEdge(sourceGraph, g.id, g, target, extractedModel, edgeToAddKey, visualModel);
                }
            }
        });

        edgeToAddKey = "profileEdges"
        extractedModel.relationshipsProfiles.forEach(rp => {
            const [source, target] = getEdgeSourceAndTargetRelationshipUsage(rp);
            if(semanticEntityRepresentingNode.id === source) {
                const visualEntity = visualEntities?.get(rp.id);
                if(visualModel === null || (visualEntity !== undefined && visualEntity.visible === true)) {
                    this.addEdge(sourceGraph, rp.id, rp, target, extractedModel, edgeToAddKey, visualModel);
                }
            }
        });

        // TODO: We don't really need the whole thing, we just need the attribute so storing the target of the relationship should be enough !
        this.attributes = extractedModel.attributes.filter(a => {
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(a);
            return this.node.id === source;
        });
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
            edge: SemanticModelEntity,
            target: string,
            extractedModel: ExtractedModel,
            edgeToAddKey: AddEdgeType,
            visualModel: VisualEntityModel | null) {
        addEdge(graph, identifier, edge, this, target, extractedModel, edgeToAddKey, visualModel);
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

    profileEdges: IEdgeClassic[] = [];
    reverseProfileEdges: IEdgeClassic[] = [];

    generalizationEdges: IEdgeClassic[] = [];
    reverseGeneralizationEdges: IEdgeClassic[] = [];

    relationshipEdges: IEdgeClassic[] = [];
    reverseRelationshipEdges: IEdgeClassic[] = [];
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


function getAllIncomingEdges(node: INodeClassic): Generator<IEdgeClassic, string, unknown> {
    const internalGenerator = getEdgesInternal([node.reverseRelationshipEdges, node.reverseGeneralizationEdges, node.reverseProfileEdges]);
    return internalGenerator;
}

function getAllOutgoingEdges(node: INodeClassic): Generator<IEdgeClassic, string, unknown> {
    // Note: I couldn't find out, why can't I just somehow return the internals of the getEdgesInternal function
    // Answer: I just had to remove the * in front of method to say that it just returns the generator and isn't the generator in itself
    const internalGenerator = getEdgesInternal([node.relationshipEdges, node.generalizationEdges, node.profileEdges]);
    return internalGenerator;
}

function *getEdgesInternal(edgesOfDifferentTypes: Array<Array<IEdgeClassic>>): Generator<IEdgeClassic, string, unknown> {
    for(const edgesOfOneType of edgesOfDifferentTypes) {
        // Note: Can't use forEach because of yield
        for(const e of edgesOfOneType) {
            yield e;
        }
    }

    return "TODO: End of generator";       // The actual value doesn't really matter, I just found it interesting that generator can return something different as last element
}

function *getAllEdges(node: INodeClassic): Generator<IEdgeClassic, string, unknown> {
    const incomingEdges = node.getAllIncomingEdges();
    const outgoingEdges = node.getAllOutgoingEdges();
    yield* incomingEdges;
    yield* outgoingEdges;

    return "TODO: End of both generators";
}
