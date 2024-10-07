import { isSemanticModelGeneralization, SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ExtractedModel, extractModelObjects, getEdgeSourceAndTargetGeneralization, getEdgeSourceAndTargetRelationship, getEdgeSourceAndTargetRelationshipUsage } from "./layout-iface";

import { VisualEntity } from "@dataspecer/core-v2/visual-model";
import { Position } from "../../core-v2/lib/visual-model/visual-entity";
import { capitalizeFirstLetter } from "./utils";

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



export class GraphClassic implements IGraphClassic {
    public constructor(inputModel: Record<string, SemanticModelEntity> | ExtractedModel, nodeContentOfGraph: Array<EdgeEndPoint> | null) {
        // https://stackoverflow.com/questions/46703364/why-does-instanceof-in-typescript-give-me-the-error-foo-only-refers-to-a-ty
        // Just simple check, dont check all elements it is not necessary
        const isExtractedModel = (inputModel as ExtractedModel).entities && (inputModel as ExtractedModel).generalizations;
        const extractedModel = isExtractedModel ? (inputModel as ExtractedModel) : extractModelObjects(inputModel as Record<string, SemanticModelEntity>);
        this.todoDebugExtractedModel = extractedModel;

        if(nodeContentOfGraph !== null) {
            const nodesMap = {};
            for(const node of nodeContentOfGraph) {
                nodesMap[node.node.id] = node;
            }
            this.nodes = nodesMap;
            return;
        }

        extractedModel.classes.forEach(c => {
            if(this.nodes[c.id] === undefined) {
                this.nodes[c.id] = new NodeClassic(c, false, extractedModel, this);
            }
        });
        extractedModel.classesProfiles.forEach(cp => {
            if(this.nodes[cp.id] === undefined) {
                // TODO: Careful, if I somehow lose (or don't check) the isProfile info stored inside the node, then I can access the iri, which profiles don't have
                this.nodes[cp.id] = new NodeClassic(cp as undefined as SemanticModelClass, true, extractedModel, this);
            }
        });
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

    public createGeneralizationSubgraphs(generalizationEdges: SemanticModelGeneralization[]) {
        // For now 1 whole hierarchy (n levels) == 1 subgraph
        // TODO: Also very slow, but I will probably have my own graph representation later, in such case getting the generalization edges neighbors and
        // performing reachability search is trivial
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

    createSubgraphAndInsert(subgraphNodes: Array<EdgeEndPoint>): IGraphClassic {
        // 1) Take ElkNodes and create one subgraph which has them as children
        const subgraph: IGraphClassic = new GraphClassic(this.todoDebugExtractedModel, subgraphNodes);      // TODO: Using the variable which I shouldnt use
        // 2) Repair the old graph by substituting the newly created subgraph from 1), while doing that also repair edges by splitting them into two parts
        //    (part inside subgraph and outside)
        this.insertSubgraphToGraph(subgraph, subgraphNodes);
        return subgraph;
    }

    insertSubgraphToGraph(subgraph: IGraphClassic, subgraphNodes: Array<EdgeEndPoint>): void {
        this.changeNodesInOriginalGraph(subgraph, subgraphNodes);
        this.repairEdgesInOriginalGraph(subgraph, subgraphNodes);
    }

    changeNodesInOriginalGraph(subgraph: IGraphClassic, subgraphNodes: Array<EdgeEndPoint>) : void {
        for(const subgraphNode of subgraphNodes) {
            delete this.nodes[subgraphNode.node.id];
        }
        this.nodes["TODO: Nejake ID subraphu"] = subgraph;
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
        const edgesGoingBeyond: IEdgeClassic[] = [];
        if(edgeEnd === "sources") {
            changedNodes.forEach(node => {
                for(const edge of node.getAllOutgoingEdges()) {
                    if(changedNodes.find(n => n.node.id === edge.end.node.id) === undefined) {
                        edgesGoingBeyond.push(edge);
                    }
                }
            });
        }
        else if(edgeEnd === "targets") {
            changedNodes.forEach(node => {
                for(const edge of node.getAllIncomingEdges()) {
                    if(changedNodes.find(n => n.node.id === edge.start.node.id) === undefined) {
                        edgesGoingBeyond.push(edge);
                    }
                }
            });
        }

        // TODO: Actually ... should visual model contain ports???? And should I have them here in my representation????!!!
        edgesGoingBeyond.forEach(e => this.splitEdgeIntoTwo(e, subgraph));
    }

    splitEdgeIntoTwo(edge: IEdgeClassic, subgraph: IGraphClassic): void {
        const targetNode = edge.end;
        edge.end = subgraph;
        const reverseEdge = targetNode.reverseRelationshipEdges.find(e => e.edge.id === edge.edge.id);
        reverseEdge.start = subgraph;

        // TODO: Well edge.edge is not the entirely correct but it may work !!!
        addEdge(subgraph,
                edge.edge,
                subgraph,
                edge.end.node.id,
                this.todoDebugExtractedModel,
                getAddEdgeTypeFromEdge(edge))
    }


    nodes: Record<string, EdgeEndPoint> = {};
    todoDebugExtractedModel: ExtractedModel;


    node: SemanticModelEntity | null;
    isDummy: boolean;
    isMainEntity: boolean;
    isProfile: boolean;

    profileEdges: Array<IEdgeClassic>;      // TODO: We are wasting a lot of space by doubling information
    reverseRelationshipEdges: Array<IEdgeClassic>;

    generalizationEdges: Array<IEdgeClassic>;
    reverseGeneralizationEdges: Array<IEdgeClassic>;

    relationshipEdges: Array<IEdgeClassic>;
    reverseProfileEdges: Array<IEdgeClassic>;
    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown> {
        throw new Error("Not implemented");
    }
    getAllIncomingEdges(): Generator<IEdgeClassic, string, unknown> {
        throw new Error("Not implemented");
    }
    getAllEdges(): Generator<IEdgeClassic, string, unknown> {
        throw new Error("Not implemented");
    }

    completeVisualEntity: IVisualEntityComplete;

    getAttributes(): SemanticModelRelationship[] {
        return [];
    }
    getSourceGraph(): IGraphClassic | null {
        return null;
    }
}

type EdgeEndPoint = INodeClassic | IGraphClassic;

// TODO: Can create more specific interfaces for generalization, etc, which will be extending this one - they will be different in the fields - edge: type and isProfile value
export interface IEdgeClassic {
    graph: IGraphClassic,

    edge: SemanticModelEntity,
    isDummy: boolean,
    isProfile: boolean,

    start: EdgeEndPoint,
    end: EdgeEndPoint,

    waypoints: Position[],
}

class EdgeClassic implements IEdgeClassic {
    constructor(edge: SemanticModelEntity, isProfile: boolean, graph: IGraphClassic, start: EdgeEndPoint, end: EdgeEndPoint) {
        this.graph = graph;
        this.isDummy = false;

        this.isProfile = isProfile;
        this.edge = edge;
        this.start = start;
        this.end = end;
    }

    graph: IGraphClassic;

    edge: SemanticModelEntity;
    isDummy: boolean;
    isProfile: boolean;

    start: EdgeEndPoint;
    end: EdgeEndPoint;

    waypoints: Position[];
}

export interface INodeClassic {
    node: SemanticModelEntity,
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
                    edge: SemanticModelEntity,
                    source: INodeClassic,
                    target: string,
                    extractedModel: ExtractedModel,
                    edgeToAddKey: AddEdgeType) {
    const reverseEdgeToAddKey: ReverseAddEdgeType = "reverse" + capitalizeFirstLetter(edgeToAddKey) as ReverseAddEdgeType;
    if(graph.nodes[target] === undefined) {
        // TODO: I think that the issue with scheme.org is generalization which has node http://www.w3.org/2000/01/rdf-schema#Class but it isn't in the model
        // At least I hope it isn't some bigger issue between DataType and rdf-schema
        const targetEntity: SemanticModelEntity = extractedModel.entities.find(e => e.id === target);
        if(targetEntity === undefined) {
            return;
        }
        // TODO: Not ideal performance wise, using find 2 times
        source.getSourceGraph().nodes[target] = new NodeClassic(targetEntity,
                                                                    extractedModel.classesProfiles.find(cp => cp.id === target) !== undefined,
                                                                    extractedModel, graph);
    }

    const edgeClassic: IEdgeClassic = new EdgeClassic(edge, edgeToAddKey === "profileEdges", graph, source, graph.nodes[target]);
    const reverseEdgeClassic: IEdgeClassic = new EdgeClassic(edge, edgeToAddKey === "profileEdges", graph, graph.nodes[target], source);

    source[edgeToAddKey].push(edgeClassic);
    graph.nodes[target][reverseEdgeToAddKey].push(reverseEdgeClassic);
}

type AddEdgeType = "relationshipEdges" | "generalizationEdges" | "profileEdges";
type ReverseAddEdgeType = "reverseRelationshipEdges" | "reverseGeneralizationEdges" | "reverseProfileEdges";

class NodeClassic implements INodeClassic {
    constructor(node: SemanticModelEntity, isProfile: boolean, extractedModel: ExtractedModel, graph: IGraphClassic) {
        this.graph = graph;
        graph.nodes[node.id] = this;
        this.node = node;
        this.isProfile = isProfile;

        let edgeToAddKey: AddEdgeType = "relationshipEdges"
        extractedModel.relationships.forEach(r => {
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(r);
            if(node.id === source) {
                this.addEdge(graph, r, target, extractedModel, edgeToAddKey);
            }
        });

        edgeToAddKey = "generalizationEdges"
        extractedModel.generalizations.forEach(g => {
            const [source, target] = getEdgeSourceAndTargetGeneralization(g);
            if(node.id === source) {
                this.addEdge(graph, g, target, extractedModel, edgeToAddKey);
            }
        });

        edgeToAddKey = "profileEdges"
        extractedModel.relationshipsProfiles.forEach(rp => {
            const [source, target] = getEdgeSourceAndTargetRelationshipUsage(rp);
            if(node.id === source) {
                this.addEdge(graph, rp, target, extractedModel, edgeToAddKey);
            }
        });

        // TODO: We don't really need the whole thing, we just need the attribute so storing the target of the relationship should be enough !
        this.attributes = extractedModel.attributes.filter(a => {
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(a);
            return this.node.id === source;
        });
    }
    getSourceGraph(): IGraphClassic {
        return this.graph;
    }
    getAttributes(): SemanticModelRelationship[] {
        return this.attributes;
    }

    addEdge(graph: IGraphClassic,
            edge: SemanticModelEntity,
            target: string,
            extractedModel: ExtractedModel,
            edgeToAddKey: AddEdgeType) {
        addEdge(graph, edge, this, target, extractedModel, edgeToAddKey);
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

    graph: IGraphClassic;

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
        const internalGenerator = this.getEdgesInternal([this.reverseRelationshipEdges, this.reverseGeneralizationEdges, this.reverseProfileEdges]);
        return internalGenerator;
    }

    getAllOutgoingEdges(): Generator<IEdgeClassic, string, unknown> {
        // Note: I couldn't find out, why can't I just somehow return the internals of the getEdgesInternal function
        // Answer: I just had to remove the * in front of method to say that it just returns the generator and isn't the generator in itself
        const internalGenerator = this.getEdgesInternal([this.relationshipEdges, this.generalizationEdges, this.profileEdges]);
        return internalGenerator;
    }

    private *getEdgesInternal(edgesOfDifferentTypes: Array<Array<IEdgeClassic>>): Generator<IEdgeClassic, string, unknown> {
        for(const edgesOfOneType of edgesOfDifferentTypes) {
            // Note: Can't use forEach because of yield
            for(const e of edgesOfOneType) {
                yield e;
            }
        }

        return "TODO: Konec";       // The actual value doesn't really matter, I just found it interesting that generator can return something different as last element
    }

    *getAllEdges(): Generator<IEdgeClassic, string, unknown> {
        const incomingEdges = this.getAllIncomingEdges();
        const outgoingEdges = this.getAllOutgoingEdges();
        yield* incomingEdges;
        yield* outgoingEdges;

        return "TODO: KONEC OBOU";
    }
}
