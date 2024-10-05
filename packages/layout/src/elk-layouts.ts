import { GraphTransformer, ExtractedModel, extractModelObjects, getEdgeSourceAndTargetRelationship, getEdgeSourceAndTargetGeneralization, LayoutAlgorithm } from "./layout-iface";
import { SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntities, VisualEntity } from "../../core-v2/lib/visual-model/visual-entity";
import { GraphClassic, IGraphClassic } from "./graph-iface";



import ELK from 'elkjs/lib/elk.bundled';

import { LayoutOptions, ElkNode, ElkExtendedEdge, ElkLabel, ElkPort } from 'elkjs/lib/elk-api';

import { BasicUserGivenConstraints, IAlgorithmOnlyConstraint, IConstraint, IConstraintSimple, UserGivenAlgorithmConfiguration, UserGivenAlgorithmConfigurationOnlyData, UserGivenConstraints } from "./configs/constraints";
import { AlgorithmName, ConstraintContainer, ElkConstraintContainer } from "./configs/constraint-container";
import { ReactflowDimensionsEstimator } from "./reactflow-dimension-estimator";
import { CONFIG_TO_ELK_CONFIG_MAP } from "./configs/elk/elk-utils";
import { NodeDimensionQueryHandler } from ".";



class ElkGraphTransformer implements GraphTransformer {
    // TODO: Either I will actually store the representation inside the class or not, If not then constructor should be empty
    constructor(extractedModel: ExtractedModel, NodeDimensionQueryHandler: NodeDimensionQueryHandler, options?: object) {
        this.todoActualGraph = new GraphClassic(extractedModel);
        this.NodeDimensionQueryHandler = NodeDimensionQueryHandler;
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

    private NodeDimensionQueryHandler;

    // TODO: It makes sense for this method to be part of interface
    convertOptions(options: object): Record<string, LayoutOptions> {
        let convertedOptions: Record<string, IConstraintSimple> = options as Record<string, IConstraintSimple>;
        // TODO: The key of record, what if we allow more and if we later allow the constraints for subsets of nodes - really the constraints are too difficult of a topic
        let resultingOptions: Record<"ALL" | "GENERALIZATION", LayoutOptions> = {
            "ALL": {},
            "GENERALIZATION": {},
        };


        for (let constraint of Object.values(convertedOptions)) {
            for (let [k, v] of Object.entries(constraint.data)) {
                const mappedKeys = CONFIG_TO_ELK_CONFIG_MAP[k];

                // TODO: This should solve the options which are control options not for Elk but for me, for example 'double-run' but probably isn't the best way
                // TODO: Maybe have another field like 'isHighLevelControl', these would be skipped here
                // TODO: the constraints should work like - I have high level constraint, then convert this into low-level constraints -
                //       for now the high-level constraints aren't that different from low level constraints in elk (only sometimes I use many of them)
                //       Only difference is in the names
                if(mappedKeys === undefined) {
                    continue;
                }

                for (const mappedKey of mappedKeys) {
                    resultingOptions[constraint.constraintedNodes][mappedKey] = String(v);
                }
                if(resultingOptions[constraint.constraintedNodes]['elk.algorithm'] === "layered") {
                    resultingOptions[constraint.constraintedNodes]['elk.edgeRouting'] = "ORTHOGONAL";
                    resultingOptions[constraint.constraintedNodes]['spacing.edgeEdge'] = "25";
                }
            }
        }
        if(Object.keys(resultingOptions["GENERALIZATION"]).length === 0) {
            resultingOptions["GENERALIZATION"] = undefined;
        }
        return resultingOptions;
    }

    convertToDataspecerRepresentation(libraryRepresentation: object | void): VisualEntities {
        // TODO: Type void should be solved better (On Fail call random layout or something, idk)
        if(libraryRepresentation === undefined) {
            return undefined;
        }
        const libraryGraph: ElkNode = libraryRepresentation as ElkNode;
        const visualEntities = this.convertElkNodeRecursively(libraryGraph, 0, 0);
        const [leftX, topY] = this.findTopLeftPosition(visualEntities);
        visualEntities.forEach(ve => {
            ve.position.x -= leftX;
            ve.position.y -= topY;
        });
        return Object.fromEntries(visualEntities.map(entity => [entity.sourceEntityId, entity])) as VisualEntities;
    }


    findTopLeftPosition(visEntities: VisualEntity[]) {
        let [leftX, topY] = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
        for(const visEnt of visEntities) {
            if(visEnt.position.x <= leftX && visEnt.position.y <= topY) {
                leftX = visEnt.position.x;
                topY = visEnt.position.y;
            }
        }

        return [leftX, topY];
    }

    private convertElkNodeRecursively(n: ElkNode, referenceX: number, referenceY: number): VisualEntity[] {
        // TODO: If we add phantom nodes (and later when also draw edges this stops working)
        let visualEntities : VisualEntity[] = [];

        for(let ch of n.children) {
            if(isSubgraph(ch)) {
                let subgraphReferenceX = referenceX + ch.x;
                let subgraphReferenceY = referenceY + ch.y;
                visualEntities = visualEntities.concat(this.convertElkNodeRecursively(ch, subgraphReferenceX, subgraphReferenceY));
            }
            else {
                visualEntities.push(this.convertElkNodeToVisualEntity(ch, referenceX, referenceY));
            }
        }

        return visualEntities;
    }

    private convertElkNodeToVisualEntity(n: ElkNode, referenceX: number, referenceY: number): VisualEntity {
        return {
            id: Math.random().toString(36).substring(2),
            type: ["visual-entity"],
            sourceEntityId: n.id,
            visible: true,
            position: { x: referenceX + n.x, y: referenceY + n.y },
            hiddenAttributes: []
        };
    }


    // TODO: Maybe move somewhere else
    hasAlgorithmConstraintForAllNodes(constraintContainer: ElkConstraintContainer): boolean {
        return constraintContainer?.algorithmOnlyConstraints["ALL"] !== undefined;
    }

    convertToLibraryRepresentation(extractedModel: ExtractedModel, constraintContainer?: ElkConstraintContainer): ElkNode {
        let mainLayoutOptions: LayoutOptions;
        let generalizationLayoutOptions: LayoutOptions;
        if(!this.hasAlgorithmConstraintForAllNodes(constraintContainer)) {
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
            mainLayoutOptions = constraintContainer.algorithmOnlyConstraints["ALL"]?.elkData;
            generalizationLayoutOptions = constraintContainer.algorithmOnlyConstraints["GENERALIZATION"]?.elkData;

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


        let nodes = extractedModel.classes.map((cls) => {
                return this.createElkNode(cls.id, true, undefined, cls.iri);
            }
        );

        const profileNodes = extractedModel.classesProfiles.map(p => {
            // TODO: The idea behind not layouting the profile classes is that we put them on correct position in second run (based on preferences, for example always under usageOf class, etc.)
            // return this.createNode(p.id, true, { "noLayout": "true" });

            return this.createElkNode(p.id, true, undefined, "USAGE OF: " + p.usageOf);
        });


        nodes = nodes.concat(profileNodes);


        // TODO: Repeating the same code 3 times - refactor - just needs different direction and method to get source and target, otherwise the same
        //       Only the class profiles are kind of weird that they don't have releationship ID
        let edges = extractedModel.relationships.map(relationship => {
            // TODO: In case of scheme.org the value in the concept field is the Owl#Thing, the actual value I want is in the iri part
            //       But then I should have the nodes inside elk with id as iri (in case of profiles the ids will stay the same)
            const [source, target, ...rest] = getEdgeSourceAndTargetRelationship(relationship);

            if(!this.isEdgeWithBothEndsInModel(extractedModel, source, target)) {
                return undefined;
            }


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

            if(!this.isEdgeWithBothEndsInModel(extractedModel, child, parent)) {
                return undefined;
            }

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

            if(!this.isEdgeWithBothEndsInModel(extractedModel, source, target)) {
                return undefined;
            }

            const [sourcePort, targetPort] = this.getSourceAndTargetPortBasedOnDirection(MAIN_EDGE_DIRECTION);

            let edge: ElkExtendedEdge = {
                id: `${profileIndex++}-${p.id}`,
                sources: [ sourcePort + source ],
                targets: [ targetPort + target ],
            }

            return edge;
        }));


        // TODO: fixed SCHEMA.ORG for now - maybe delete later
        edges = edges.filter(e => e !== undefined);

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

    // TODO: fixes SCHEMA.ORG vocabulary and other models - If the class isn't part of the model, ignore the edge - may not be optimal performance wise
    // TODO: May delete later
    isEdgeWithBothEndsInModel(extractedModel: ExtractedModel, source: string, target: string): boolean {
        return (extractedModel.classes.findIndex(e => e.id === source) >= 0 || extractedModel.classesProfiles.findIndex(e => e.id === source) >= 0) &&
                (extractedModel.classes.findIndex(e => e.id === target) >= 0 || extractedModel.classesProfiles.findIndex(e => e.id === target) >= 0)
    }

    // TODO: Now I am actually not sure, since north isn't always north (it depends on the direction of layout algorithm),
    //       maybe this is incorrect, but I can't check it easily right now (because Online ELKjs interpreter isn't working)
    getSourceAndTargetPortBasedOnDirection(direction: string): [string, string] {
        // const sourceAndTargetMap = {
        //     "UP": ["N-", "W-"],
        //     "DOWN": ["S-", "W-"],
        //     "RIGHT": ["N-", "W-"],
        //     "LEFT": ["N-", "E-"]
        // }
        // return sourceAndTargetMap[direction];
        return ["N-", "W-"];
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


        const subgraph: ElkNode = this.createElkNode(`subgraph${this.subgraphCurrID++}`, false, layoutOptions);
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
            return changedNodes.findIndex(n => n.id === convertNodePortIdToId(e.sources[0])) >= 0 && changedNodes.findIndex(n => n.id === convertNodePortIdToId(e.targets[0])) >= 0;
        });
        // TODO: If there alerady existed some edges in the subgraph then this destroys them
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
            return changedNodes.findIndex(n => n.id === convertNodePortIdToId(e[edgeEnd][0])) >= 0;
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
        let genSubgraphs: ElkNode[][] = subgraphs.map(subgraph => {
            // This removes the labels, so it is better to just paste in the original node
            // TODO: Or maybe the copy of it, but for now just paste in the original one
            // return subgraph.map(nodeID => this.createNode(nodeID, true));     // TODO: What about subgraphs inside subgraphs

            // TODO: Expects that that are no subgraphs in children
            return subgraph.map(nodeID => graph.children.find(ch => ch.id === nodeID));
        });

        console.log("Generated subgraphs:");
        console.log(subgraphs);
        console.log(genSubgraphs);
        // TODO: Just as in the relationships (in case of Schema.org) we have to remove the nodes which are not part of model
        // TODO: This is exactly the reason why I need to have my own graph representation as single source of truth - because here I am again
        //       removing nodes which shouldn't be in the graph in the first place, because I already removed them
        genSubgraphs = genSubgraphs.map(subgraph => subgraph.filter(n => n !== undefined));
        console.log(genSubgraphs);


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


    createElkNode(id: string, shouldComputeSize?: boolean, layoutOptions?: LayoutOptions, label?: string): ElkNode {
        const width: number = shouldComputeSize ? this.NodeDimensionQueryHandler.getWidth(this.todoActualGraph.nodes[id]) : 500;
        const height: number = shouldComputeSize ? this.NodeDimensionQueryHandler.getHeight(this.todoActualGraph.nodes[id]) : 300;

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


async function performGeneralizationTwoRunLayout(graphInElk: ElkNode, elk): Promise<ElkNode | void> {
    let layoutPromises = [];
    let subgraphAllEdges: [ElkExtendedEdge[], ElkExtendedEdge[]][] = [];
    let subgraphIndices: number[] = [];
    console.log("GRAPH BEFORE DOUBLE LAYOUTING:");
    console.log(JSON.stringify(graphInElk));
    for(const [index, subgraph] of graphInElk.children.entries()) {
        console.log(index);
        console.log(subgraph);
        if(isSubgraph(subgraph)) {
            console.log(subgraph);
            subgraphIndices.push(index);
            // TODO: The variant which removes the edges going to the subgraph boundaries, other solution is
            //       to box it inside another node and the reroute the edges there (or actually don't even have to reroute if I swap the order of the subgraphs)
            const [keptEdges, removedEdges] = removeEdgesLeadingToSubgraphInsideSubgraph(subgraph);
            subgraphAllEdges.push([keptEdges, removedEdges]);
            subgraph.edges = keptEdges;
            console.log("THE layouted SUBGRAPH:");
            console.log(subgraph);
            console.log(JSON.stringify(subgraph));
            const layoutPromise = elk.layout(subgraph)
                .then(console.log)
                .catch(console.error);
            layoutPromises.push(layoutPromise);
        }
    }
    await Promise.all(layoutPromises);
    console.log("GRAPH AFTER FIRST LAYOUTING:");
    console.log(JSON.stringify(graphInElk));
    for(const [i, [keptEdges, removedEdges]] of subgraphAllEdges.entries()) {
        console.log("Layouted subgraph");
        console.log(graphInElk.children[subgraphIndices[i]]);
        graphInElk.children[subgraphIndices[i]].edges = graphInElk.children[subgraphIndices[i]].edges.concat(removedEdges);
    }
    console.log("GRAPH AFTER FIRST LAYOUTING AND REPAIRING EDGES:");
    console.log(JSON.stringify(graphInElk));


    for(const subgraph of graphInElk.children) {
        if(isSubgraph(subgraph)) {
            // TODO: Actually I don't think this is needed
            fixNodesInsideGraph(subgraph);
        }
    }

    // graphInElk.children[subgraphIndices[0]].children = undefined;
    // graphInElk.children[subgraphIndices[0]].edges = undefined;
    // graphInElk.children = graphInElk.children.slice(0, subgraphIndices[0]).concat(graphInElk.children.slice(subgraphIndices[0] + 1));
    // graphInElk.layoutOptions = {'elk.algorithm': 'force'};


    const layoutPromise = elk.layout(graphInElk)
                             .catch(console.error);
    layoutPromise.then(console.log);
    return layoutPromise
}

function fixNodesInsideGraph(graph: ElkNode) {
    graph.layoutOptions['elk.algorithm'] = 'fixed';
}

function removeEdgesLeadingToSubgraphInsideSubgraph(subgraph: ElkNode): [ElkExtendedEdge[], ElkExtendedEdge[]] {
    const keptEdges: ElkExtendedEdge[] = [];
    const removedEdges: ElkExtendedEdge[] = [];
    for(const e of subgraph.edges) {
        if(convertNodePortIdToId(e.sources[0]) === subgraph.id || convertNodePortIdToId(e.targets[0]) === subgraph.id) {
            removedEdges.push(e);
        }
        else {
            keptEdges.push(e);
        }
    }

    // keptEdges.forEach(e => console.log(e));
    // keptEdges.forEach(e => console.log("::::::::::::::"));
    // console.log(keptEdges.length);
    // console.log(keptEdges[0].sections);
    // for(let i = 0; i < keptEdges.length; i++) {
    //     console.log(i);
    //     console.log(keptEdges[i]);
    //     console.log(JSON.stringify(keptEdges[i]));
    // }

    return [keptEdges, removedEdges];
}

/**
 * Destructively changes graphInElk, that means it should be copy of the original graph
 * @param graphInElk
 * @param subgraph
 * @deprecated
 */
function replaceSubgraphWithOneNode(graphInElk: ElkNode, subgraph: ElkNode): ElkExtendedEdge[] {
    const edges = subgraph.edges;
    subgraph.edges = [];
    return edges;
    //fixEdgesWhenReplacingSubgraphWithOneNode(graphInElk, subgraph);
}

/**
 * Destructively changes graphInElk, that means it should be copy of the original graph
 * @param graphInElk
 * @param subgraph
 * @deprecated
 */
function fixEdgesWhenReplacingSubgraphWithOneNode(graphInElk: ElkNode, subgraph: ElkNode) {
    // TODO: What about subgraphs within subgraphs - right now not supported so I don't need to care (and hopefully it won't be needed in future)
    for(const node of graphInElk.children) {
        if(node.edges !== undefined) {
            const newEdges: ElkExtendedEdge[] = [];
            for(const e of node.edges) {
                const sID = convertNodePortIdToId(e.sources[0]);
                const tID = convertNodePortIdToId(e.targets[0]);

                // TODO: Optimization - can be computed in one run instead of using 2x findIndex
                const isEdgeWithinSubgraph: boolean = (isSubgraphID(sID) && subgraph.children.findIndex(ch => ch.id === tID) >= 0) ||
                                                      (isSubgraphID(tID) && subgraph.children.findIndex(ch => ch.id === sID) >= 0);
                if(!isEdgeWithinSubgraph) {
                    newEdges.push(e);
                }

                // TODO: Actually this isn't needed if we are working with subgraphs they are already split into 2 parts
                //       So we just need to remove all the edges which go between the subgraph and internal nodes in subgraph
                //       (Such nodes should exist only within the "subgraph.edges", so again this shouldn't be needed)
                // subgraph.children.forEach(ch => {
                //     if(ch.id !== sID && ch.id !== tID) {
                //         newEdges.push(e);
                //     }
                //     else if(ch.id === sID) {
                //         let newEdge = {...e};
                //         newEdge.sources = [subgraph.id];
                //         newEdges.push(newEdge);
                //     }
                //     else if(ch.id === tID) {
                //         let newEdge = {...e};
                //         newEdge.targets = [subgraph.id];
                //         newEdges.push(newEdge);
                //     }
                //     // Else it is edge in the subgraph, but that shouldn't happen, edges within subgraph should be only in the "subgraph.edges"
                // });

                node.edges = newEdges;
            }
        }
    }
}




function convertNodePortIdToId(id: string): string {
    return id.slice(2);
}

function isSubgraph(subgraph: ElkNode): boolean {
    return isSubgraphID(subgraph.id);
}
function isSubgraphID(id: string): boolean {
    return id.startsWith("subgraph");
}

function shouldPerformGeneralizationTwoRunLayout(algorithmOnlyConstraint: IAlgorithmOnlyConstraint): boolean {
    return algorithmOnlyConstraint !== undefined && algorithmOnlyConstraint.data["double_run"];
}


export class ElkLayout implements LayoutAlgorithm {
    prepare(extractedModel: ExtractedModel, constraintContainer: ElkConstraintContainer, nodeDimensionQueryHandler: NodeDimensionQueryHandler): void {
        this.elkGraphTransformer = new ElkGraphTransformer(extractedModel, nodeDimensionQueryHandler, constraintContainer);
        this.graphInElk = this.elkGraphTransformer.convertToLibraryRepresentation(extractedModel, constraintContainer);
        this.constraintContainer = constraintContainer;
        this.nodeDimensionQueryHandler = nodeDimensionQueryHandler;

        // console.log(this.graphInElk);
    }

    async run(): Promise<VisualEntities> {
        const elk = new ELK();
        let layoutPromise: Promise<ElkNode | void>;

        const constraint = this.constraintContainer.algorithmOnlyConstraints["GENERALIZATION"];
        if(shouldPerformGeneralizationTwoRunLayout(constraint)) {
            layoutPromise = performGeneralizationTwoRunLayout(this.graphInElk, elk);
        }
        else {
            layoutPromise = elk.layout(this.graphInElk)
                                .catch(console.error);
        }

        // console.log(await layoutPromise.then(this.elkGraphTransformer.convertToDataspecerRepresentation(this.graphInElk)));
        // console.log(this.graphInElk);
        // console.log(layoutPromise.then(layoutedGraph => this.elkGraphTransformer.convertToDataspecerRepresentation(layoutedGraph)));
        // console.log("DONE");


        console.log("layoutPromise.then(console.log)");
        layoutPromise.then(console.log);
        return layoutPromise.then(layoutedGraph => this.elkGraphTransformer.convertToDataspecerRepresentation(layoutedGraph));
    }
    stop(): void {
        throw new Error("TODO: Implement me if you want webworkers and parallelization ... actually nevermind this should be one level up");
    }

    graphInElk: ElkNode;
    constraintContainer: ConstraintContainer;
    elkGraphTransformer: ElkGraphTransformer;
    nodeDimensionQueryHandler: NodeDimensionQueryHandler;
}


// export async function doElkLayout(inputSemanticModel: Record<string, SemanticModelEntity>, options: object): Promise<VisualEntities> {
//     console.log("ELK LAYOUT");

//     const extractedModel = extractModelObjects(inputSemanticModel);

//     const elkGraphTransformer: ElkGraphTransformer = new ElkGraphTransformer(extractedModel, options);
//     let graphInElk: ElkNode = elkGraphTransformer.convertToLibraryRepresentation(extractedModel, options);

//     console.log("Extracted model:");
//     console.log(extractedModel);

//     console.log("Graph in ELK");
//     console.log({...graphInElk});
//     console.log(JSON.stringify(graphInElk));


//     const elk = new ELK();

//     if(shouldPerformGeneralizationTwoRunLayout(options)) {
//         await performGeneralizationTwoRunLayout(graphInElk, elk);
//     }
//     else {
//         const layoutPromise = elk.layout(graphInElk)
//             .then(console.log)
//             .catch(console.error);
//         await layoutPromise;
//     }

//     // graphInElk.layoutOptions = {
//     //     "elk.algorithm": "sporeCompaction",
//     //     "spacing.nodeNode": "64",
//     // };
//     // await elk.layout(graphInElk)
//     //         .then(console.log)
//     //         .catch(console.error);


// // TODO: Testing running stress algorithm after layout to place the profile nodes
// /*
//     const { entities, classes, classesProfiles, relationships, relationshipsProfiles, generalizations } = extractedModel;
//     graphInElk.layoutOptions = {"elk.algorithm": "stress", "interactive": "true"};
//     classes.forEach(cls => {
//         const index: number = graphInElk.children.findIndex(ch => ch.id === cls.id);
//         graphInElk.children[index].layoutOptions = { "org.eclipse.elk.stress.fixed": "true" };
//     });
//     classesProfiles.forEach(cls => {
//         const index: number = graphInElk.children.findIndex(ch => ch.id === cls.id);
//         graphInElk.children[index].layoutOptions = { "noLayout": "false" };
//         const usageOfElkNode: ElkNode = graphInElk.children.find(c => c.id === cls.usageOf);
//         graphInElk.children[index].x = usageOfElkNode.x;
//         graphInElk.children[index].y = usageOfElkNode.y + 800;
//         const e = addPhantomEdge(graphInElk, graphInElk.children[index].id, usageOfElkNode.id);
//         e["layoutOptions"] = { "desiredEdgeLength": "400" };
//     });

//     console.log("CHANGED ELK GRAPH:");
//     console.log(graphInElk);

//     const changedGraphLayoutPromise = elk.layout(graphInElk)
//          .then(console.log)
//          .catch(console.error);
//     await changedGraphLayoutPromise;
// */



// //    graphInElk.layoutOptions = {"elk.algorithm": "org.eclipse.elk.sporeOverlap", "interactive": "true"};
// //    await elk.layout(graphInElk)
// //         .then(console.log)
// //         .catch(console.error);

//     const layoutedGraphInDataspecer: VisualEntities = elkGraphTransformer.convertToDataspecerRepresentation(graphInElk);
//     return layoutedGraphInDataspecer;
// }


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