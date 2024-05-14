import { GraphTransformer, ExtractedModel, extractModelObjects, getEdgeSourceAndTargetRelationship, getEdgeSourceAndTargetGeneralization } from "./layout-iface";
import { SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntities, VisualEntity } from "../../core-v2/lib/visual-model/visual-entity";
import { GraphClassic, IGraphClassic } from "./graph-iface";



import ELK from 'elkjs/lib/elk.bundled';

import { LayoutOptions, ElkNode, ElkExtendedEdge, ElkLabel, ElkPort } from 'elkjs/lib/elk-api';

import { IConstraintSimple } from "./constraints";


class ElkGraphTransformer implements GraphTransformer {
    private CONFIG_NAME_MAP: Record<string, string[]> = {
        "main-layout-alg": ["elk.algorithm"],
        "main-alg-direction": ['elk.direction'],
        "layer-gap": ["spacing.nodeNodeBetweenLayers"],
        "in-layer-gap": ["spacing.nodeNode", "spacing.edgeNode"],
    
        "stress-edge-len": ["org.eclipse.elk.stress.desiredEdgeLength"],
    
        "general-main-alg-direction": ['elk.direction'],
        "general-layer-gap": ["spacing.nodeNodeBetweenLayers"],
        "general-in-layer-gap": ["spacing.nodeNode", "spacing.edgeNode"],
    };


    // TODO: Either I will actually store the representation inside the class or not, If not then constructor should be empty
    constructor(extractedModel: ExtractedModel, options?: object) {
        this.todoActualGraph = new GraphClassic(extractedModel);
    }

    convertGraphToLibraryRepresentation(graph: IGraphClassic, options?: object): object {
        throw new Error("Method not implemented.");
    }
    convertLibraryToGraphRepresentation(libraryRepresentation: object, includeDummies: boolean): IGraphClassic {
        throw new Error("Method not implemented.");
    }
    updateExistingGraphRepresentationBasedOnLibraryRepresentation(libraryRepresentation: object, graphToBeUpdated: IGraphClassic, includeNewVertices: boolean): void {
        throw new Error("Method not implemented.");
    }

    // TODO: For now this is just to estimate the width/height, otherwise we don't use the graph yet, so it is kind of useless and waste of space
    private todoActualGraph: GraphClassic;

    convertOptions(options: object): Record<string, LayoutOptions> {
        let convertedOptions: Record<string, IConstraintSimple> = options as Record<string, IConstraintSimple>;
        // TODO: The key of record, what if we allow more and if we later allow the constraints for subsets of nodes - 
        //       - I really need to think about this more later
        let resultingOptions: Record<"ALL" | "GENERALIZATION", LayoutOptions> = {
            "ALL": {},
            "GENERALIZATION": {},
        };


        for (let constraint of Object.values(convertedOptions)) {            
            for (let [k, v] of Object.entries(constraint.data)) {
                const mappedKeys = this.CONFIG_NAME_MAP[k];                                
                for (const mappedKey of mappedKeys) {
                    resultingOptions[constraint.constraintedNodes][mappedKey] = String(v);
                }
                if(resultingOptions[constraint.constraintedNodes]['elk.algorithm'] === "layered") {
                    resultingOptions[constraint.constraintedNodes]['elk.edgeRouting'] = "SPLINES";
                    resultingOptions[constraint.constraintedNodes]['spacing.edgeEdge'] = "25";                    
                }
            }            
        }   
        if(Object.keys(resultingOptions["GENERALIZATION"]).length === 0) {
            resultingOptions["GENERALIZATION"] = undefined;
        }
        return resultingOptions;
    }

    convertToDataspecerRepresentation(libraryRepresentation: object): VisualEntities {
        const libraryGraph: ElkNode = libraryRepresentation as ElkNode;        
        const visualEntities = this.convertElkNodeRecursively(libraryGraph, 0, 0);
        return Object.fromEntries(visualEntities.map(entity => [entity.sourceEntityId, entity])) as VisualEntities;          
    }

    private convertElkNodeRecursively(n: ElkNode, referenceX: number, referenceY: number): VisualEntity[] {
        // TODO: If we add phantom nodes (and later when also draw edges this stops working)
        let visualEntities : VisualEntity[] = []
        for(let ch of n.children) {            
            if(ch.id.startsWith("subgraph")) {
                let subgraphReferenceX = referenceX + ch.x;
                let subgraphReferenceY = referenceY + ch.y;
                visualEntities = visualEntities.concat(this.convertElkNodeRecursively(ch, subgraphReferenceX, subgraphReferenceY));
            }
            else {
                visualEntities.push(this.convertSingleNode(ch, referenceX, referenceY));
            }
        }

        return visualEntities;
    }

    private convertSingleNode(n: ElkNode, referenceX: number, referenceY: number): VisualEntity {
        return {
            id: Math.random().toString(36).substring(2), // random unique id of visual entity
            type: ["visual-entity"], // type of visual entity, keep it as is
            sourceEntityId: n.id, // id of the class you want to visualize
            visible: true,
            position: { x: referenceX + n.x, y: referenceY + n.y },
            hiddenAttributes: []
        };
    }


    convertToLibraryRepresentation(extractedModel: ExtractedModel, options?: object): ElkNode {    
        let mainLayoutOptions: LayoutOptions;
        let generalizationLayoutOptions: LayoutOptions;
        let convertedOptions: Record<string, LayoutOptions>;
        if(options === undefined) {
            mainLayoutOptions = { 
                'elk.algorithm': 'layered', 
                'elk.direction': 'UP', 
                "elk.edgeRouting": "SPLINES",
                "spacing.nodeNodeBetweenLayers": "100",
                "spacing.nodeNode": "100",
                "spacing.edgeNode": "100",
                "spacing.edgeEdge": "25",
            };
        }
        else {
            convertedOptions = this.convertOptions(options);
            mainLayoutOptions = convertedOptions['ALL'];   
            generalizationLayoutOptions = convertedOptions["GENERALIZATION"];

            // TODO: Don't know the exact reason why this error is happening, but I think that for example if we have
            //       the main algorithm set as layered with direction to LEFT and the generalization to right, then there exists such edges
            //       which goes against the flow and can't be drawn using splines, so we need to draw them orthogonally
            //       Downside of having orthogonal edge routing is that the resulting layout inside CME is slightly worse
            if(mainLayoutOptions["elk.algorithm"] === "layered" && generalizationLayoutOptions !== undefined && mainLayoutOptions["elk.direction"] !== generalizationLayoutOptions["elk.direction"]) {
                //mainLayoutOptions['org.eclipse.elk.hierarchyHandling'] = "INCLUDE_CHILDREN";
                 mainLayoutOptions['elk.edgeRouting'] = "ORTHOGONAL";
                 generalizationLayoutOptions['elk.edgeRouting'] = "ORTHOGONAL";
            }
        }
        const MAIN_EDGE_DIRECTION: string = mainLayoutOptions['elk.direction'] === undefined ? "UP" : mainLayoutOptions['elk.direction'];
        const GENERALIZATION_EDGE_DIRECTION: string = generalizationLayoutOptions === undefined ? MAIN_EDGE_DIRECTION : generalizationLayoutOptions['elk.direction'];


        let nodes = extractedModel.classes.map((cls) =>
            {
                return this.createNode(cls.id, true);
            });

        const profileNodes = extractedModel.classesProfiles.map(p => {
            // TODO: The idea behind not layouting the profile classes is that we put them on correct position in second run (based on preferences, for example always under usageOf class, etc.)
            // return this.createNode(p.id, true, { "noLayout": "true" });

            return this.createNode(p.id, true);            
        });
        
        
        nodes = nodes.concat(profileNodes);
        

        // TODO: Repeating the same code 3 times - refactor - just needs different direction and method to get source and target, otherwise the same
        //       Only the class profiles are kind of weird that they don't have releationship ID
        let edges = extractedModel.relationships.map(relationship => {
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(relationship);
                        
            const [sourcePort, targetPort] = this.getSourceAndTargetPortBasedOnDirection(MAIN_EDGE_DIRECTION);            

            let edge: ElkExtendedEdge = {
                id: relationship.id,
                sources: [ sourcePort + source ],
                targets: [ targetPort + target ],
            }

            return edge;
        });

        edges = edges.concat(extractedModel.generalizations.map(gen => {
            const [child, parent] = getEdgeSourceAndTargetGeneralization(gen);            

            const [sourcePort, targetPort] = this.getSourceAndTargetPortBasedOnDirection(GENERALIZATION_EDGE_DIRECTION);

            let edge: ElkExtendedEdge = {
                id: gen.id,
                sources: [ sourcePort + child ],
                targets: [ targetPort + parent ],
            }

            return edge;
        }));  
        
        let profileIndex = 0;
        edges = edges.concat(extractedModel.classesProfiles.map(p => {
            const [source, target] = [p.id, p.usageOf];
                        
            const [sourcePort, targetPort] = this.getSourceAndTargetPortBasedOnDirection(MAIN_EDGE_DIRECTION);            

            let edge: ElkExtendedEdge = {
                id: `${profileIndex++}-${p.id}`,
                sources: [ sourcePort + source ],
                targets: [ targetPort + target ],
            }

            return edge;
        }));
        

        // TODO: Profile edges should be done by using agregator probably or something (maybe same for profile classes)
/*        
        const profileEdges = extractedModel.relationshipsProfiles.map(relationship => {
            let source, target: string;
            if(relationship.ends[0].iri == null) {
                source = relationship.ends[0].concept;
                target = relationship.ends[1].concept;
            }
            else {
                source = relationship.ends[1].concept;
                target = relationship.ends[0].concept;
            }
            let edge: ElkExtendedEdge = {
                id: relationship.id,
                sources: [ source ],
                targets: [ target ],
            }

            return edge
        });

        edges = edges.concat(profileEdges);
*/        
        

        let graph: ElkNode = {
            id: "root",
            layoutOptions: mainLayoutOptions,        
            children: nodes,
            edges: edges
        };

        
        if(generalizationLayoutOptions !== undefined) {
            this.addGeneralizationEdges(graph, extractedModel.generalizations, generalizationLayoutOptions);
        }

        return graph;
    }

    // TODO: Now I am actually not sure, since north isn't always north (it depends on the direction of layout algorithm), 
    //       maybe this is incorrect, but I can't check it easily right now (because Online ELKjs interpreter isn't working)
    getSourceAndTargetPortBasedOnDirection(direction: string): [string, string] {
        const sourceAndTargetMap = {
            "UP": ["N-", "W-"],
            "DOWN": ["S-", "W-"],
            "RIGHT": ["N-", "W-"],
            "LEFT": ["N-", "E-"]
        }
        return sourceAndTargetMap[direction];
    }


    createSubgraphFromNodesAndInsert(graph: ElkNode, subgraphNodes: Array<ElkNode>, subgraphLayoutOptions?: LayoutOptions): ElkNode {
        // 1) Take ElkNodes and create one subgraph which has them as children
        const subgraph: ElkNode = this.convertSubgraphListToActualSubgraph(subgraphNodes, subgraphLayoutOptions);
        // 2) Repair the old graph by substituting the newly created subgraph from 1), while doing that also repair edges by splitting them into two parts
        //    (part inside subgraph and outside)
        this.insertSubgraphToGraph(graph, subgraph, subgraphNodes);
        return subgraph; 
    }

    subgraphCurrID: number = 0;

    convertSubgraphListToActualSubgraph(subgraphNodes: Array<ElkNode>, subgraphLayoutOptions?: LayoutOptions): ElkNode {

        let layoutOptions: LayoutOptions = (subgraphLayoutOptions !== undefined) ? subgraphLayoutOptions : {
            // ...subgraph?.layoutOptions,      // TODO: If the given subgraph already had some options, then they should be copied
          
            "elk.algorithm": "layered", 
            "elk.direction": "UP",

            "spacing.nodeNodeBetweenLayers": "100",
            "spacing.nodeNode": "100",
            "spacing.edgeNode": "100",
            "spacing.edgeEdge": "25",          
        };


        const subgraph: ElkNode = this.createNode(`subgraph${this.subgraphCurrID++}`, false, layoutOptions);
        subgraph.children = subgraphNodes;
        return subgraph;
    }

    insertSubgraphToGraph(graph: ElkNode, subgraph: ElkNode, subgraphNodes: Array<ElkNode>): void {
       this.changeNodesInOriginalGraph(graph, subgraph, subgraphNodes);
       this.repairEdgesInOriginalGraph(graph, subgraph, subgraphNodes);
    }

    changeNodesInOriginalGraph(graph: ElkNode, subgraph: ElkNode, subgraphNodes: Array<ElkNode>) : void {
        let newChildren: Array<ElkNode> = graph.children.filter(ch => subgraphNodes.findIndex(subgraphNode => ch.id === subgraphNode.id) < 0);
        newChildren.push(subgraph);
        graph.children = newChildren;
    }

    repairEdgesInOriginalGraph(graph: ElkNode, subgraph: ElkNode, changedNodes: Array<ElkNode>) : void {
        // This is needed, because if we don't put the edges inside the subgraph, then Elk can't work with it
        this.repairEdgesInsideSubgraph(graph, subgraph, changedNodes);
        this.repairEdgesGoingBeyondSubgraph(graph, subgraph, changedNodes);
    }

    repairEdgesInsideSubgraph(graph: ElkNode, subgraph: ElkNode, changedNodes: Array<ElkNode>) {
        let edgesInSubgraph = graph.edges.filter(e => {
            // TODO: Could be done faster ... for example the slicing could be performed only once
            return changedNodes.findIndex(n => n.id === e.sources[0].slice(2)) >= 0 && changedNodes.findIndex(n => n.id === e.targets[0].slice(2)) >= 0;           
        });
        // TODO: If there are alerady existed some edges in the subgraph then this destroys them
        subgraph.edges = edgesInSubgraph;    
        graph.edges = graph.edges.filter(e => edgesInSubgraph.findIndex(eis => e.id === eis.id) < 0);
    }

    repairEdgesGoingBeyondSubgraph(graph: ElkNode, subgraph: ElkNode, changedNodes: Array<ElkNode>) {
        this.repairEdgesGoingBeyondSubgraphInternal(graph, subgraph, changedNodes, "sources");
        this.repairEdgesGoingBeyondSubgraphInternal(graph, subgraph, changedNodes, "targets");
    }


    private setDirectionForEdgeRepair(graph: ElkNode): string {
        let edgeDirectionOutsideSubgraph: string;
        if(graph.layoutOptions['elk.algorithm'] === "layered") {
            edgeDirectionOutsideSubgraph = graph.layoutOptions['elk.direction'] === undefined ? "UP" : graph.layoutOptions['elk.direction'];
        }
        else {
            edgeDirectionOutsideSubgraph = "UP";
        }

        return edgeDirectionOutsideSubgraph;
    }
    
    /**
     * 
     * @param graph 
     * @param subgraph 
     * @param changedNodes 
     * @param edgeEnd is either "sources" or "targets", if it is sources then it repairs edges going out of subgraph, "targets" then going in
     */
    private repairEdgesGoingBeyondSubgraphInternal(graph: ElkNode, subgraph: ElkNode, changedNodes: Array<ElkNode>, edgeEnd: "sources" | "targets") {
        let edgesGoingBeyond = graph.edges.filter(e => {            
            return changedNodes.findIndex(n => n.id === e[edgeEnd][0].slice(2)) >= 0;           
        });

        // TODO: Maybe should pass it from the parameters instead of looking it up in the graph
        let edgeDirectioOutsideSubgraph: string = this.setDirectionForEdgeRepair(graph);
        let edgeDirectionInSubgraph: string = this.setDirectionForEdgeRepair(subgraph);        
        
        // TODO: Now I actually don't know what port should be the correct one, 
        //       I guess that the target one and should it be different for incoming and outgoing edges?
        //const subgraphPortID = edgeEnd === "sources" ? ("N-" + subgraph.id) : ("S-" + subgraph.id);
        if(edgeEnd === "sources") {
            const [s, t] = this.getSourceAndTargetPortBasedOnDirection(edgeDirectionInSubgraph);
            const subgraphPortID = t + subgraph.id;
            edgesGoingBeyond.forEach(e => this.splitEdgeIntoTwo(e, subgraphPortID, subgraph.edges, graph.edges));        
        }
        else {
            const [s, t] = this.getSourceAndTargetPortBasedOnDirection(edgeDirectioOutsideSubgraph);
            const subgraphPortID = t + subgraph.id;
            edgesGoingBeyond.forEach(e => this.splitEdgeIntoTwo(e, subgraphPortID, graph.edges, subgraph.edges));        
        }
        graph.edges = graph.edges.filter(e => edgesGoingBeyond.findIndex(eis => e.id === eis.id) < 0);
    }

    splitEdgeIntoTwo(edge: ElkExtendedEdge, intermediateNodeID: string, 
                     edgesArrayForFirstSplit: ElkExtendedEdge[], 
                     edgesArrayForSecondSplit: ElkExtendedEdge[]): [ElkExtendedEdge, ElkExtendedEdge] {
        let edge1, edge2: ElkExtendedEdge;
        edge1 = {
            id: edge.id + "-SPLIT1",
            sources: edge.sources,
            targets: [intermediateNodeID],
        };
        edge2 = {
            id: edge.id + "-SPLIT2",
            sources: [intermediateNodeID],
            targets: edge.targets,
        };
        if(edgesArrayForFirstSplit !== undefined && edgesArrayForSecondSplit !== undefined) {
            edgesArrayForFirstSplit.push(edge1);
            edgesArrayForSecondSplit.push(edge2);
        }
        return [edge1, edge2];
    }

    addNewNodeToSubgraph(subgraph: ElkNode, nodeToAdd: ElkNode): void {
        subgraph.children.push(nodeToAdd);        
    }

    addNodeFromGraphToSubgraph(graph: ElkNode, subgraph: ElkNode, nodeToAdd: ElkNode): void {
        this.addNewNodeToSubgraph(subgraph, nodeToAdd);
        graph.children = graph.children.filter(ch => ch.id !== nodeToAdd.id);
    }

    addGeneralizationEdges(graph: ElkNode, genEdges: SemanticModelGeneralization[], generalizationOptions?: LayoutOptions): Array<ElkNode> {        
        // For now 1 whole hierarchy (n levels) == 1 subgraph
        // TODO: Also very slow, but I will probably have my own graph representation later, in such case getting the generalization edges neighbors and 
        // performing reachability search is trivial
        let parents: Record<string, string[]> = {};
        let children: Record<string, string[]> = {};
        genEdges.forEach(g => {
            if(parents[g.child] === undefined) {
                parents[g.child] = [];
            }
            parents[g.child].push(g.parent);

            if(children[g.parent] === undefined) {
                children[g.parent] = [];
            }
            children[g.parent].push(g.child);
        });

        const subgraphs: string[][] = this.getGeneralizationSubgraphs(parents, children);
        const genSubgraphs: ElkNode[][] = subgraphs.map(subgraph => {
            return subgraph.map(nodeID => this.createNode(nodeID, true));     // TODO: What about subgraphs inside subgraphs
        });

        
        let createdSubgraphs: Array<ElkNode> = [];
        genSubgraphs.forEach(subg => {
            createdSubgraphs.push(this.createSubgraphFromNodesAndInsert(graph, subg, generalizationOptions));
        });
  

        return createdSubgraphs;
    }
    
    getGeneralizationSubgraphs(parents: Record<string, string[]>, children: Record<string, string[]>): string[][] {
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

    createPorts(id: string): ElkPort[] {
        // TODO: For now just fix the ports no matter the given layout options
        const ports: ElkPort[] = [];
        const portSides: string[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
        for(let i = 0; i < 4; i++) {
            const port: ElkPort = {
                'id': `${portSides[i].slice(0, 1)}-${id}`,
                layoutOptions: {
                    'port.side': portSides[i],
                    'port.index': `${i}`,
                },
                
            };
            ports.push(port);
        };

        return ports;
    }

    getDefaultLayoutOptionsForNode() {
        const portOptions = {
            "portConstraints": "FIXED_SIDE", 
            "nodeLabels.placement": "[H_LEFT, V_TOP, OUTSIDE]", 

            // TODO: !!! It actually works better without CENTERING (at least I think - should test it again properly)
            // "org.eclipse.elk.portAlignment.default": "CENTER",      // Put all to center, can also specify based on side (north, west, east, south), ie.                                                                         
            // "org.eclipse.elk.portAlignment.north": "BEGIN",         // But the actual side is based on the direction of layout alg!!!!! 
        };

        return portOptions;
    }

    createNode(id: string, shouldComputeSize?: boolean, layoutOptions?: LayoutOptions, label?: string): ElkNode {
        const width: number = shouldComputeSize ? this.todoActualGraph.nodes[id].computeWidth() : 500;
        const height: number = shouldComputeSize ? this.todoActualGraph.nodes[id].computeHeight() : 300;

        const ports: ElkPort[] = this.createPorts(id);
        const portOptions = this.getDefaultLayoutOptionsForNode();

        const nodeLabel: ElkLabel = { text: label === undefined ? id : label };
        let node: ElkNode;
        if (layoutOptions === undefined) {
            node = {
                id: id,
                labels: [ nodeLabel ],
                width: width,
                height: height,
                ports: ports,                
                layoutOptions: portOptions,
            };
        }
        else {
            node = {
                id: id,
                labels: [ nodeLabel ],
                width: width,
                height: height,
                layoutOptions: {...layoutOptions, ...portOptions},
                ports: ports,
            };            
        }

        return node;
    }    
}


export async function doElkLayout(inputSemanticModel: Record<string, SemanticModelEntity>, options: object): Promise<VisualEntities> {
    console.log("ELK LAYOUT");

    const extractedModel = extractModelObjects(inputSemanticModel);
    
    const elkGraphTransformer: ElkGraphTransformer = new ElkGraphTransformer(extractedModel, options);
    let graphInElk: ElkNode = elkGraphTransformer.convertToLibraryRepresentation(extractedModel, options);

    console.log("Graph in ELK");
    console.log({...graphInElk});


    const elk = new ELK();

    const layoutPromise = elk.layout(graphInElk)
         .then(console.log)
         .catch(console.error);
    await layoutPromise;   

// TODO: Testing running stress algorithm after layout to place the profile nodes
/*
    const { entities, classes, classesProfiles, relationships, relationshipsProfiles, generalizations } = extractedModel;
    graphInElk.layoutOptions = {"elk.algorithm": "stress", "interactive": "true"};
    classes.forEach(cls => {
        const index: number = graphInElk.children.findIndex(ch => ch.id === cls.id);
        graphInElk.children[index].layoutOptions = { "org.eclipse.elk.stress.fixed": "true" };
    });
    classesProfiles.forEach(cls => {
        const index: number = graphInElk.children.findIndex(ch => ch.id === cls.id);
        graphInElk.children[index].layoutOptions = { "noLayout": "false" };
        const usageOfElkNode: ElkNode = graphInElk.children.find(c => c.id === cls.usageOf);
        graphInElk.children[index].x = usageOfElkNode.x;
        graphInElk.children[index].y = usageOfElkNode.y + 800;
        const e = addPhantomEdge(graphInElk, graphInElk.children[index].id, usageOfElkNode.id);         
        e["layoutOptions"] = { "desiredEdgeLength": "400" };
    });

    console.log("CHANGED ELK GRAPH:");
    console.log(graphInElk);

    const changedGraphLayoutPromise = elk.layout(graphInElk)
         .then(console.log)
         .catch(console.error);
    await changedGraphLayoutPromise;  
*/



//    graphInElk.layoutOptions = {"elk.algorithm": "org.eclipse.elk.sporeOverlap", "interactive": "true"};
//    await elk.layout(graphInElk)
//         .then(console.log)
//         .catch(console.error);

    const layoutedGraphInDataspecer: VisualEntities = elkGraphTransformer.convertToDataspecerRepresentation(graphInElk);
    return layoutedGraphInDataspecer;
}


let phantomNodeIndex: number = 0;
let phantomEdgeIndex: number = 0;
function addPhantomNode(elkGraph: ElkNode) {
    throw new Error("TODO: Not Implemented");
    phantomNodeIndex++;
}

function addPhantomEdge(elkGraph: ElkNode, sourceID: string, targetID: string): ElkExtendedEdge {
    const phantomEdge: ElkExtendedEdge = {
        id: `phantom-edge${phantomEdgeIndex}`,
        sources: [ sourceID ],
        targets: [ targetID ],
    };
    phantomEdgeIndex++;
    elkGraph.edges.push(phantomEdge);
    return phantomEdge;
}