import { GraphTransformer, ExtractedModels, extractModelObjects, getEdgeSourceAndTargetRelationship, getEdgeSourceAndTargetGeneralization, LayoutAlgorithm } from "./layout-iface";
import { SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { isVisualProfileRelationship, isVisualRelationship, Position, VISUAL_NODE_TYPE, VISUAL_PROFILE_RELATIONSHIP_TYPE, VISUAL_RELATIONSHIP_TYPE, VisualEntity, VisualNode, VisualProfileRelationship, VisualRelationship } from "@dataspecer/core-v2/visual-model";
import { EdgeEndPoint, GraphClassic, GraphFactory, IGraphClassic, IMainGraphClassic, INodeClassic, IVisualNodeComplete, MainGraphClassic, VisualNodeComplete } from "./graph-iface";



import ELK from 'elkjs/lib/elk.bundled';

import ElkConstructor, { LayoutOptions, ElkNode, ElkExtendedEdge, ElkLabel, ElkPort, type ELK as ELKType } from 'elkjs/lib/elk-api';

import { BasicUserGivenConstraints, ConstraintedNodesGroupingsType, IAlgorithmConfiguration, IAlgorithmOnlyConstraint, IConstraint, IConstraintSimple, SPECIFIC_ALGORITHM_CONVERSIONS_MAP, UserGivenAlgorithmConfiguration, UserGivenAlgorithmConfigurationOnlyData, UserGivenConstraints } from "./configs/constraints";
import { AlgorithmName, ConstraintContainer, ElkConstraintContainer } from "./configs/constraint-container";
import { ReactflowDimensionsEstimator } from "./dimension-estimators/reactflow-dimension-estimator";
import { CONFIG_TO_ELK_CONFIG_MAP } from "./configs/elk/elk-utils";
import { NodeDimensionQueryHandler, ReactflowDimensionsConstantEstimator, XY } from ".";
import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getTopLeftPosition, PhantomElementsFactory, placePositionOnGrid } from "./util/utils";
import _, { clone } from "lodash";
import { GraphAlgorithms } from "./graph-algoritms";
import { ElkConstraint } from "./configs/elk/elk-constraints";
import { VisualEntities } from "./migration-to-cme-v2";


type VisualEntitiesType = (VisualNodeComplete | VisualRelationship | VisualProfileRelationship)[];

/**
 * The Transformer class for conversion between our graph representation and ELK graph representation. For more info check {@link GraphTransformer} docs.
 */
class ElkGraphTransformer implements GraphTransformer {
    // TODO: Either I will actually store the representation inside the class or not, If not then constructor should be empty
    constructor(graph: IGraphClassic, options?: object) {
        console.log("graph in ElkGraphTransformer");
        console.log(graph);
        this.graph = graph.mainGraph;
    }

    convertGraphToLibraryRepresentation(graph: IGraphClassic,
                                        shouldSetLayoutOptions: boolean,
                                        constraintContainer: ElkConstraintContainer,
                                        elkNodeToSet?: ElkNode): ElkNode {
        return this.convertGraphToLibraryRepresentationInternal(graph, shouldSetLayoutOptions, constraintContainer, elkNodeToSet);
    }

    convertLayoutOptionsToElkLayoutOptions(
        layoutOptions: Record<string, string>,
    ) {
        const elkLayoutOptions: Record<string, string> = {};
        Object.entries(layoutOptions).forEach(([key, value]) => elkLayoutOptions[CONFIG_TO_ELK_CONFIG_MAP[key] ?? key] = value);
        return Object.values(elkLayoutOptions).length === 0 ? undefined : elkLayoutOptions;
    }

    /**
     * Internal function for conversion from our graph representation to ELK representation. The method is called recursively for subgraphs.
     */
    convertGraphToLibraryRepresentationInternal(
        graph: IGraphClassic,
        shouldSetLayoutOptions: boolean,
        constraintContainer?: ElkConstraintContainer,
        elkNodeToSet?: ElkNode
    ): ElkNode {
        console.info("convertGraphToLibraryRepresentationInternal", {...graph})

        let nodes = Object.entries(graph.nodes).map(([id, node]) => {
            if(node.isConsideredInLayout === false) {
                return null;
            }

            console.warn("Visual node copy before createElkNode");
            console.warn(_.cloneDeep(node));
            if(node.isProfile) {
                return this.createElkNode(id, constraintContainer, node, elkNodeToSet, true, "USAGE OF: " + (node.semanticEntityRepresentingNode as SemanticModelClassUsage).usageOf);
            }
            else {
                const elkNode = this.createElkNode(id, constraintContainer, node, elkNodeToSet, true, node?.semanticEntityRepresentingNode?.iri);     // TODO: Not sure what is the ID (visual or semantic entity id?)
                if(node instanceof GraphClassic) {
                    this.convertGraphToLibraryRepresentationInternal(node, true, constraintContainer, elkNode);
                }
                return elkNode;
            }
        }).filter(n => n !== null);

        const edges = [];

        Object.entries(graph.nodes).map(([id, node]) => {
            // console.log("node");
            // console.log(node);
            // console.log(node.getAllOutgoingEdges());
            for(const edge of node.getAllOutgoingEdges()) {
                if(edge.isConsideredInLayout === false) {
                    continue;
                }


                // TODO: Remove the commented code after debugging visual model
                // console.log("Created edge:");
                // console.log("START:");
                // console.log(edge.start.node?.iri ?? edge.start.id);
                // console.log("END:");
                // console.log(edge.end.node?.iri ?? edge.end.id);


                // TODO: For now just up, I am not sure if I will be using the ports anyways
                const [sourcePort, targetPort] = this.getSourceAndTargetPortBasedOnDirection("UP");

                const source = edge.reverseInLayout === false ? edge.start.id : edge.end.id;
                const target = edge.reverseInLayout === false ? edge.end.id : edge.start.id;

                const layoutOptions = this.convertLayoutOptionsToElkLayoutOptions(edge.layoutOptions);
                let elkEdge: ElkExtendedEdge = {
                    id: edge.id,
                    // sources: [ sourcePort + edge.start.id ],
                    // targets: [ targetPort + edge.end.id ],
                    sources: [ source ],
                    targets: [ target ],
                    layoutOptions,
                }
                edges.push(elkEdge);
            }


            // let edge: ElkExtendedEdge = {
            //     id: relationship.id,
            //     sources: [ sourcePort + source ],
            //     targets: [ targetPort + target ],
            // }

            // return edge;
        });


        let elkGraph: ElkNode;
        if(elkNodeToSet === undefined) {
            elkGraph = {
                id: "root",
                children: nodes,
                edges: edges
            };
        }
        else {
            elkGraph = elkNodeToSet;
            elkGraph.children = nodes;
            elkGraph.edges = edges;
        }

        if(shouldSetLayoutOptions) {
            if((constraintContainer.currentLayoutAction.action.constraintedNodes === "GENERALIZATION" && isSubgraph(this.graph, elkGraph)) ||
                (constraintContainer.currentLayoutAction.action.constraintedNodes === "ALL" && (graph instanceof MainGraphClassic))) {
                elkGraph.layoutOptions = (constraintContainer.currentLayoutAction.action as (IAlgorithmConfiguration & ElkConstraint)).elkData;
            }
            else if(isSubgraph(this.graph, elkGraph)) {
                elkGraph.layoutOptions = {
                    "algorithm": "fixed"
                };
            }
        }

        console.log("elkGraph after conversion");
        console.log(_.cloneDeep(elkGraph));

        return elkGraph;
    }



    /**
     * The implementation creates deep copy of the input graph, updates the copy and returns it.
     */
    convertLibraryToGraphRepresentation(libraryRepresentation: ElkNode | null, includeDummies: boolean): IMainGraphClassic {
        // TODO: 1) This is really simple implementation
        //       2) It should be noted in docs that we are actually just cloning the old graph and update the copy and creating completely new one - because the results may slightly differ
        //       3) Using this.graph ... it makes sense since it is the input graph
        const clonedGraph = _.cloneDeep(this.graph);
        // TODO: Ideally we would have some clone method which clones the necessary stuff, but keeps relevant references, we can also try to create the graph from scratch
        //       like this, but it is to specific and usually breaks on different ids
        //       ..... so remove these TODOs if the cloneDeep is enough
        // const clonedGraph = GraphFactory.createMainGraph(this.graph.mainGraph.id, this.graph.todoDebugExtractedModel, null);
        // (clonedGraph as MainGraphClassic).createGeneralizationSubgraphsFromStoredTODOExtractedModel();  // TODO: For now

        this.updateExistingGraphRepresentationBasedOnLibraryRepresentation(libraryRepresentation, clonedGraph, includeDummies, true);

        return clonedGraph;
    }

    private approximatelyEqual(xy1: XY, xy2: XY, epsilon: number = 0.001) {
        return Math.abs(xy1.x - xy2.x) < epsilon && Math.abs(xy1.y - xy2.y) < epsilon ;
    }

    updateExistingGraphRepresentationBasedOnLibraryRepresentation(libraryRepresentation: ElkNode | null,
                                                                    graphToBeUpdated: IGraphClassic,        // TODO: Can use this.graph instead
                                                                    includeNewVertices: boolean,
                                                                    shouldUpdateEdges: boolean): VisualEntities {
        // TODO: Type void (respectively null) should be solved better (On Fail call random layout or something, idk)
        if(libraryRepresentation === null) {
            return {};
        }

        const anchoredNode = this.findAnchoredNodeWithUnchanchoredEnd(graphToBeUpdated);
        const tmpPos = anchoredNode?.completeVisualNode?.coreVisualNode?.position ?? {x: 0, y: 0};
        const anchoredPositionBeforeLayout: XY = {...tmpPos};

        const visualEntities = this.recursivelyUpdateGraphBasedOnElkNode(libraryRepresentation, graphToBeUpdated, 0, 0, shouldUpdateEdges);
        // TODO: Actually moving all to the origin point [0, 0] is sometimes unwanted - For example when using the elk.stress algorithm to find position for 1 element
        //       We don't want to move everything, but just the 1 node. So either 1) remove it or
        //                                                                        2) It should be GraphTransformation action ... probably 2)
        // const visualNodes = visualEntities.filter(visualEntity => this.isGraphNode(visualEntity)).map(ve => (ve as VisualNodeComplete).coreVisualNode);
        // const [leftX, topY] = this.findTopLeftPosition(visualNodes);
        console.warn("Positions before performing anchor shift");
        console.warn(JSON.stringify(Object.values(visualEntities).filter(this.isGraphNode).map(n => [n.coreVisualNode.representedEntity, n.coreVisualNode.position])));

        let positionShiftDueToAnchors: XY = {x: 0, y: 0};
        if(anchoredNode !== null) {
            positionShiftDueToAnchors.x = anchoredNode.completeVisualNode.coreVisualNode.position.x - anchoredPositionBeforeLayout.x;
            positionShiftDueToAnchors.y = anchoredNode.completeVisualNode.coreVisualNode.position.y - anchoredPositionBeforeLayout.y;
        }

        visualEntities.forEach(visualEntity => {
            if(this.isGraphNode(visualEntity)) {
                // TODO: Comment the code for now, as said above
                // visualEntity.coreVisualNode.position.x -= leftX;
                // visualEntity.coreVisualNode.position.y -= topY;

                // TODO: Maybe should have set method on graph instead which does the conversion to grid automatically and maybe should also should update edges?
                //       (It is most likely the case - After realizing that I want have moving to top left position as GraphTransformation action)
                //       Also we can't access the cme configuration (applications/conceptual-model-editor/src/application/configuration.ts) from here
                //       So I am not sure how one should solve this.
                //       1) Include the reference to CME so we can access the configuration or put the configuration somewhere out since it is constant
                //       2) Work without it and put it to the grid only when adding to the visual model (but if we are doing that from the manager we also can't access config)
                //          Another drawback is that the graph metrics are then working with slightly different graph

                visualEntity.addToPositionInCoreVisualNode(-positionShiftDueToAnchors.x, -positionShiftDueToAnchors.y);
            }
            else if(isVisualRelationship(visualEntity) || isVisualProfileRelationship(visualEntity)) {
                for(let i = 0; i < visualEntity.waypoints.length; i++) {
                    // TODO: Comment the code for now, as said above
                    // visualEntity.waypoints[i].x -= leftX;
                    // visualEntity.waypoints[i].y -= topY;
                    visualEntity.waypoints[i].x -= positionShiftDueToAnchors.x;
                    visualEntity.waypoints[i].y -= positionShiftDueToAnchors.y;
                }
            }
        });

        console.warn("Positions after performing anchor shift");
        console.warn(JSON.stringify(Object.values(visualEntities).filter(this.isGraphNode).map(n => [n.coreVisualNode.representedEntity, n.coreVisualNode.position])));


        return Object.fromEntries(visualEntities.map(visualEntity => {
            if(this.isGraphNode(visualEntity)) {
                return [visualEntity.coreVisualNode.representedEntity, visualEntity.coreVisualNode];
            }
            else if(isVisualRelationship(visualEntity)) {
                return [visualEntity.representedRelationship, visualEntity];
            }
            else if(isVisualProfileRelationship(visualEntity)) {
                return [visualEntity.entity, visualEntity];
            }
        })) as VisualEntities;
    }

    // TODO: Method maybe should be defined in the graph instead
    isGraphNode(possibleNode: object): possibleNode is VisualNodeComplete {
        return "coreVisualNode" in possibleNode;
    }


    /**
     * Recursively updates {@link graphToBeUpdated} based on positions in {@link elkNode}.
     */
    recursivelyUpdateGraphBasedOnElkNode(elkNode: ElkNode, graphToBeUpdated: IGraphClassic, referenceX: number, referenceY: number, shouldUpdateEdges: boolean): VisualEntitiesType {
        // TODO: If we add phantom nodes (and later when also draw edges this may stop working)
        let visualEntities : VisualEntitiesType = [];
        console.info("referenceX");
        console.info({...elkNode});
        console.info(elkNode);
        console.info(referenceX);
        console.info(referenceY);

        for(let ch of elkNode.children) {
            const newPosition = this.convertElkNodeToPosition(ch, referenceX, referenceY);
            const node = graphToBeUpdated.mainGraph.findNodeInAllNodes(ch.id);
            node.completeVisualNode.coreVisualNode.position = {
                ...newPosition,
                anchored: node.completeVisualNode.coreVisualNode.position.anchored,
            };

            visualEntities.push(node.completeVisualNode);

            // TODO RadStr LAYOUT: Have a better way to check if node is a graph ... but maybe ok
            if(isSubgraph(this.graph, ch)) {
                node.completeVisualNode.width = elkNode.width ?? node.completeVisualNode.width;
                node.completeVisualNode.height = elkNode.height ?? node.completeVisualNode.height;

                let subgraphReferenceX = referenceX + ch.x;
                let subgraphReferenceY = referenceY + ch.y;

                const childVisualEntities = this.recursivelyUpdateGraphBasedOnElkNode(
                    ch, graphToBeUpdated, subgraphReferenceX, subgraphReferenceY, shouldUpdateEdges);
                visualEntities = visualEntities.concat(childVisualEntities);
            }
        }

        if(shouldUpdateEdges) {
            for(let edge of elkNode.edges) {
                const waypoints = this.convertElkEdgeToWaypoints(edge, referenceX, referenceY);
                const edgeInGraph = graphToBeUpdated.mainGraph.findEdgeInAllEdges(edge.id);
                // TODO: Update the visual entity of edge or create new one .... But what about the split ones???
                edgeInGraph.visualEdge.visualEdge.waypoints = waypoints;
                visualEntities.push(edgeInGraph.visualEdge.visualEdge);
            }
        }
        return visualEntities;
    };


    // TODO: Actually should we even store the graph, shouldn't we pass it in methods?
    private graph: IMainGraphClassic;

    // TODO: It makes sense for this method to be part of interface
    /**
     *
     * @deprecated
     */
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
        return null;        // The method is deprecated, so no need to bother, I will probably delete it anyways

        // // TODO: Type void should be solved better (On Fail call random layout or something, idk)
        // if(libraryRepresentation === undefined) {
        //     return undefined;
        // }
        // const libraryGraph: ElkNode = libraryRepresentation as ElkNode;
        // const visualEntities = this.convertElkNodeToVisualEntitiesRecursively(libraryGraph, 0, 0);
        // const visualNodes = visualEntities.filter(isVisualNode);
        // const [leftX, topY] = this.findTopLeftPosition(visualNodes);
        // // TODO: Must also update stuff which aren't nodes
        // visualNodes.forEach(ve => {
        //     ve.position.x -= leftX;
        //     ve.position.y -= topY;
        // });

        // return Object.fromEntries(visualEntities.map(entity => [entity.sourceEntityId, entity])) as VisualEntities;
    }


    /**
     * @returns Top left corner of the top left entity in given {@link visualNodes}
     */
    findTopLeftPosition(visualNodes: VisualNode[]) {
        let [leftX, topY] = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
        for(const visEnt of visualNodes) {
            if(visEnt.position.x <= leftX && visEnt.position.y <= topY) {
                leftX = visEnt.position.x;
                topY = visEnt.position.y;
            }
        }

        return [leftX, topY];
    }


    /**
     * We have to do this, because Elk is being funny. Because even when node is anchored it can be moved.
     * The relative positions are kept, but the absolute ones are not, so we have to
     * shift it all back if there was anchored node in the visual model (alternative solution could be to move the viewport in editor after layout).
     * To make it more clear why we need this: For performance reasons, in the visual model we update only those nodes, which were not anchored
     * Therefore we have to perform the shift, otherwise we add nodes to wrong positions.
     *
     * Not only that, there is difference between nodes with at least 1 edge and nodes without edges.
     * Those without edges are layouted as if there was no anchor.
     * Since we don't care about those no edges node, we have to find the one with at least one edge.
     * Edit: On top of that, there is difference between nodes which are connected to only anchored nodes and those which are not.
     * (Or maybe when the whole subgraph is anchored ... I didn't check that)
     */
    private findAnchoredNodeWithUnchanchoredEnd(graph: IGraphClassic): EdgeEndPoint | null {
        for(const [identifier, node] of Object.entries(graph.nodes)) {
            if(node.completeVisualNode.isAnchored === true) {
                (node.getAllOutgoingEdges().next().done !== true || node.getAllIncomingEdges().next().done !== true);
                let hasUnanchoredEnd = false;
                for(const outgoingEdge of node.getAllOutgoingEdges()) {
                    if(outgoingEdge.isConsideredInLayout && !outgoingEdge.end.completeVisualNode.isAnchored) {
                        hasUnanchoredEnd = true;
                        break;
                    }
                }
                if(hasUnanchoredEnd) {
                    return node;
                }

                for(const incomingEdge of node.getAllIncomingEdges()) {
                    if(incomingEdge.isConsideredInLayout && !incomingEdge.start.completeVisualNode.isAnchored) {
                        hasUnanchoredEnd = true;
                        break;
                    }
                }
                if(hasUnanchoredEnd) {
                    return node;
                }
            }
        }

        return null;
    }


    /**
     * @param elkNode
     * @param referenceX relative x coordinate of the current elkNode to its parenting subgraph
     * @param referenceY same as {@link referenceX}, but for y coordinate
     * @returns visual entities based on given {@link elkNode}.
     */
    private convertElkNodeToVisualEntitiesRecursively(elkNode: ElkNode, referenceX: number, referenceY: number, graphToBeUpdated: IGraphClassic): VisualEntity[] {
        // TODO: If we add phantom nodes (and later when also draw edges this stops working)
        let visualEntities : VisualEntity[] = [];

        for(let ch of elkNode.children) {
            if(isSubgraph(this.graph, ch)) {
                let subgraphReferenceX = referenceX + ch.x;
                let subgraphReferenceY = referenceY + ch.y;
                visualEntities = visualEntities.concat(this.convertElkNodeToVisualEntitiesRecursively(ch, subgraphReferenceX, subgraphReferenceY, graphToBeUpdated));
            }
            else {
                const position = this.convertElkNodeToPosition(ch, referenceX, referenceY);
                const node = graphToBeUpdated.nodes[ch.id];
                node.completeVisualNode.setPositionInCoreVisualNode(position.x, position.y);
                visualEntities.push(node.completeVisualNode.coreVisualNode);
            }
        }

        return visualEntities;
    }


    // TODO: Maybe in future we will have also return the start/end points instead of just the waypoints
    // TODO: Maybe the referenceX and referenceY have to be also used for edges in case of subgraphs
    /**
     * Converts given {@link elEdge} to the waypoints within the edge
     * @param referenceX is the reference x coordinate used to shift the x position in the resulting visual entity.
     * This is used because elk returns positions relative to the parent subgraph.
     * @param referenceY same as {@link referenceX} but for y coordinate.
     * @returns Waypoints from the given {@link elkEdge}
     */
    private convertElkEdgeToWaypoints(elkEdge: ElkExtendedEdge, referenceX: number, referenceY: number): Position[] {
        const bendpoints = elkEdge?.sections?.[0].bendPoints;
        const waypoints: Position[] = bendpoints?.map(bendpoint => {
            return {
                x: bendpoint.x,
                y: bendpoint.y,
                anchored: null
            };
        }) ?? [];

        return waypoints;
    }

    /**
     *
     * @param referenceX is the reference x coordinate used to shift the x position in the resulting visual entity.
     * This is used because elk returns positions relative to the parent subgraph.
     * @param referenceY same as {@link referenceX} but for y coordinate.
     * @returns Position for the given {@link elkNode}, the position should be put into corresponding graph node.
     */
    private convertElkNodeToPosition(elkNode: ElkNode, referenceX: number, referenceY: number): XY {
        return {
            x: referenceX + elkNode.x,
            y: referenceY + elkNode.y,
        };
    }


    // TODO: Maybe move somewhere else
    // TODO: Should I even use it???
    static hasAlgorithmConstraintForAllNodes(constraintContainer: ElkConstraintContainer): boolean {
        return constraintContainer?.currentLayoutAction.action.constraintedNodes === "ALL";
    }

    /**
     * @deprecated
     */
    convertToLibraryRepresentation(extractedModel: ExtractedModels, constraintContainer?: ElkConstraintContainer): ElkNode {
        return null; // Deprecated ... remove later
//         let mainLayoutOptions: LayoutOptions;
//         let generalizationLayoutOptions: LayoutOptions;
//         if(!ElkGraphTransformer.hasAlgorithmConstraintForAllNodes(constraintContainer)) {
//             mainLayoutOptions = {
//                 'elk.algorithm': 'layered',
//                 'elk.direction': 'UP',
//                 "elk.edgeRouting": "SPLINES",
//                 "spacing.nodeNodeBetweenLayers": "100",
//                 "spacing.nodeNode": "100",
//                 "spacing.edgeNode": "100",
//                 "spacing.edgeEdge": "25",
//             };
//         }
//         else {
//             // Deprecated so whaterevr
//             mainLayoutOptions = {};
//             generalizationLayoutOptions = {};

//             // TODO: Don't know the exact reason why this error is happening, but I think that for example if we have
//             //       the main algorithm set as layered with direction to LEFT and the generalization to right, then there exists such edges
//             //       which goes against the flow and can't be drawn using splines, so we need to draw them orthogonally
//             //       Downside of having orthogonal edge routing is that the resulting layout inside CME is slightly worse


// 	    // TODO: Set only when necessary ... just for debug now ... or actually just keep the ORTHOGONAL
//             // if(mainLayoutOptions["elk.algorithm"] === "layered" && generalizationLayoutOptions !== undefined && mainLayoutOptions["elk.direction"] !== generalizationLayoutOptions["elk.direction"]) {
//             //     //mainLayoutOptions['org.eclipse.elk.hierarchyHandling'] = "INCLUDE_CHILDREN";
//             //      mainLayoutOptions['elk.edgeRouting'] = "ORTHOGONAL";
//             //      generalizationLayoutOptions['elk.edgeRouting'] = "ORTHOGONAL";
//             // }
//             mainLayoutOptions['elk.edgeRouting'] = "ORTHOGONAL";
//             generalizationLayoutOptions['elk.edgeRouting'] = "ORTHOGONAL";
//         }
//         const MAIN_EDGE_DIRECTION: string = mainLayoutOptions['elk.direction'] === undefined ? "UP" : mainLayoutOptions['elk.direction'];
//         const GENERALIZATION_EDGE_DIRECTION: string = generalizationLayoutOptions === undefined ? MAIN_EDGE_DIRECTION : generalizationLayoutOptions['elk.direction'];


//         let nodes = extractedModel.classes.map((cls) => {
//                 return this.createElkNode(cls.id, null, true, undefined, cls.iri);
//             }
//         );

//         const profileNodes = extractedModel.classesProfiles.map(p => {
//             // TODO: The idea behind not layouting the profile classes is that we put them on correct position in second run (based on preferences, for example always under usageOf class, etc.)
//             // return this.createNode(p.id, true, { "noLayout": "true" });

//             return this.createElkNode(p.id, null, true, undefined, "USAGE OF: " + p.usageOf);
//         });


//         nodes = nodes.concat(profileNodes);


//         // TODO: Repeating the same code 3 times - refactor - just needs different direction and method to get source and target, otherwise the same
//         //       Only the class profiles are kind of weird that they don't have releationship ID
//         let edges = extractedModel.relationships.map(relationship => {
//             // TODO: In case of scheme.org the value in the concept field is the Owl#Thing, the actual value I want is in the iri part
//             //       But then I should have the nodes inside elk with id as iri (in case of profiles the ids will stay the same)
//             const {source, target, ...rest} = getEdgeSourceAndTargetRelationship(relationship);

//             if(!this.isEdgeWithBothEndsInModel(extractedModel, source, target)) {
//                 return undefined;
//             }


//             const [sourcePort, targetPort] = this.getSourceAndTargetPortBasedOnDirection(MAIN_EDGE_DIRECTION);

//             let edge: ElkExtendedEdge = {
//                 id: relationship.id,
//                 sources: [ sourcePort + source ],
//                 targets: [ targetPort + target ],
//             }

//             return edge;
//         });

//         edges = edges.concat(extractedModel.generalizations.map(gen => {
//             const {source: child, target: parent} = getEdgeSourceAndTargetGeneralization(gen);

//             if(!this.isEdgeWithBothEndsInModel(extractedModel, child, parent)) {
//                 return undefined;
//             }

//             const [sourcePort, targetPort] = this.getSourceAndTargetPortBasedOnDirection(GENERALIZATION_EDGE_DIRECTION);

//             let edge: ElkExtendedEdge = {
//                 id: gen.id,
//                 sources: [ sourcePort + child ],
//                 targets: [ targetPort + parent ],
//             }

//             return edge;
//         }));

//         let profileIndex = 0;
//         edges = edges.concat(extractedModel.classesProfiles.map(p => {
//             const [source, target] = [p.id, p.usageOf];

//             if(!this.isEdgeWithBothEndsInModel(extractedModel, source, target)) {
//                 return undefined;
//             }

//             const [sourcePort, targetPort] = this.getSourceAndTargetPortBasedOnDirection(MAIN_EDGE_DIRECTION);

//             let edge: ElkExtendedEdge = {
//                 id: `${profileIndex++}-${p.id}`,
//                 sources: [ sourcePort + source ],
//                 targets: [ targetPort + target ],
//             }

//             return edge;
//         }));


//         // TODO: fixed SCHEMA.ORG for now - maybe delete later
//         edges = edges.filter(e => e !== undefined);

//         // TODO: Profile edges should be done by using agregator probably or something (maybe same for profile classes)
// /*
//         const profileEdges = extractedModel.relationshipsProfiles.map(relationship => {
//             let source, target: string;
//             if(relationship.ends[0].iri == null) {
//                 source = relationship.ends[0].concept;
//                 target = relationship.ends[1].concept;
//             }
//             else {
//                 source = relationship.ends[1].concept;
//                 target = relationship.ends[0].concept;
//             }
//             let edge: ElkExtendedEdge = {
//                 id: relationship.id,
//                 sources: [ source ],
//                 targets: [ target ],
//             }

//             return edge
//         });

//         edges = edges.concat(profileEdges);
// */


//         let graph: ElkNode = {
//             id: "root",
//             layoutOptions: mainLayoutOptions,
//             children: nodes,
//             edges: edges
//         };


//         if(generalizationLayoutOptions !== undefined) {
//             this.createAndAddGeneralizationSubgraphsInElk(graph, extractedModel.generalizations, generalizationLayoutOptions);
//         }

//         return graph;
    }

    // TODO: !!!! Should be ok now and satisfied in the input graph already
    // TODO: fixes SCHEMA.ORG vocabulary and other models - If the class isn't part of the model, ignore the edge - may not be optimal performance wise
    // TODO: May delete later
    /**
     * @deprecated
     */
    isEdgeWithBothEndsInModel(extractedModels: ExtractedModels, source: string, target: string): boolean {
        return false;       // TODO: Deprecated ... remove later
        // return (extractedModel.classes.findIndex(e => e.id === source) >= 0 || extractedModel.classesProfiles.findIndex(e => e.id === source) >= 0) &&
        //         (extractedModel.classes.findIndex(e => e.id === target) >= 0 || extractedModel.classesProfiles.findIndex(e => e.id === target) >= 0)
    }

    // TODO: Now I am actually not sure, since north isn't always north (it depends on the direction of layout algorithm),
    //       maybe this is incorrect, but I can't check it easily right now (because Online ELKjs interpreter isn't working)
    getSourceAndTargetPortBasedOnDirection(direction: string): [string, string] {
        // const sourceAndTargetMap = {
        //     "Up": ["N-", "W-"],
        //     "Down": ["S-", "W-"],
        //     "Right": ["N-", "W-"],
        //     "Left": ["N-", "E-"]
        // }
        // return sourceAndTargetMap[direction];
        return ["N-", "W-"];
    }


    /**
     * @deprecated
     */
    createElkSubgraphFromNodesAndInsertToElkGraph(graph: ElkNode, subgraphNodes: Array<ElkNode>, subgraphLayoutOptions?: LayoutOptions): ElkNode {
        // 1) Take ElkNodes and create one subgraph which has them as children
        const subgraph: ElkNode = this.convertSubgraphListToActualSubgraph(subgraphNodes, subgraphLayoutOptions);
        // 2) Repair the old graph by substituting the newly created subgraph from 1), while doing that also repair edges by splitting them into two parts
        //    (part inside subgraph and outside)
        this.insertSubgraphToGraph(graph, subgraph, subgraphNodes);
        return subgraph;
    }

    /**
     * @deprecated
     */
    subgraphCurrID: number = 0;

    /**
     * @deprecated
     */
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


        // Deprecated ... so we didn't bother with fixing ... we will just remove it in later commit !!
        const subgraph: ElkNode = this.createElkNode(`subgraph${this.subgraphCurrID++}`, null, null, null, false);
        subgraph.children = subgraphNodes;
        return subgraph;
    }


    /**
     * @deprecated
     */
    insertSubgraphToGraph(graph: ElkNode, subgraph: ElkNode, subgraphNodes: Array<ElkNode>): void {
        this.changeNodesInOriginalGraph(graph, subgraph, subgraphNodes);
        this.repairEdgesInOriginalGraph(graph, subgraph, subgraphNodes);
    }


    /**
     * @deprecated
     */
    changeNodesInOriginalGraph(graph: ElkNode, subgraph: ElkNode, subgraphNodes: Array<ElkNode>) : void {
        let newChildren: Array<ElkNode> = graph.children.filter(ch => subgraphNodes.findIndex(subgraphNode => ch.id === subgraphNode.id) < 0);
        newChildren.push(subgraph);
        graph.children = newChildren;
    }


    /**
     * @deprecated
     */
    repairEdgesInOriginalGraph(graph: ElkNode, subgraph: ElkNode, changedNodes: Array<ElkNode>) : void {
        // This is needed, because if we don't put the edges inside the subgraph, then Elk can't work with it
        this.repairEdgesInsideSubgraph(graph, subgraph, changedNodes);
        this.repairEdgesGoingBeyondSubgraph(graph, subgraph, changedNodes);
    }


    /**
     * @deprecated
     */
    repairEdgesInsideSubgraph(graph: ElkNode, subgraph: ElkNode, changedNodes: Array<ElkNode>) {
        const edgesInSubgraph = graph.edges.filter(e => {
            // TODO: Could be done faster ... for example the slicing could be performed only once
            return changedNodes.findIndex(n => n.id === convertNodePortIdToNodeId(e.sources[0])) >= 0 && changedNodes.findIndex(n => n.id === convertNodePortIdToNodeId(e.targets[0])) >= 0;
        });
        // TODO: If there alerady existed some edges in the subgraph then this destroys them
        subgraph.edges = edgesInSubgraph;
        graph.edges = graph.edges.filter(e => edgesInSubgraph.findIndex(eis => e.id === eis.id) < 0);
    }


    /**
     * @deprecated
     */
    repairEdgesGoingBeyondSubgraph(graph: ElkNode, subgraph: ElkNode, changedNodes: Array<ElkNode>) {
        this.repairEdgesGoingBeyondSubgraphInternal(graph, subgraph, changedNodes, "sources");
        this.repairEdgesGoingBeyondSubgraphInternal(graph, subgraph, changedNodes, "targets");
    }


    /**
     * @deprecated
     */
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
     * @deprecated
     * @param edgeEnd is either "sources" or "targets", if it is sources then it repairs edges going out of subgraph, "targets" then going in
     */
    private repairEdgesGoingBeyondSubgraphInternal(graph: ElkNode, subgraph: ElkNode, changedNodes: Array<ElkNode>, edgeEnd: "sources" | "targets") {
        let edgesGoingBeyond = graph.edges.filter(e => {
            return changedNodes.findIndex(n => n.id === convertNodePortIdToNodeId(e[edgeEnd][0])) >= 0;
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


    /**
     * @deprecated
     */
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


    /**
     * @deprecated
     */
    addNewNodeToSubgraph(subgraph: ElkNode, nodeToAdd: ElkNode): void {
        subgraph.children.push(nodeToAdd);
    }


    /**
     * @deprecated
     */
    addNodeFromGraphToSubgraph(graph: ElkNode, subgraph: ElkNode, nodeToAdd: ElkNode): void {
        this.addNewNodeToSubgraph(subgraph, nodeToAdd);
        graph.children = graph.children.filter(ch => ch.id !== nodeToAdd.id);
    }


    /**
     * @deprecated
     */
    createAndAddGeneralizationSubgraphsInElk(graph: ElkNode, genEdges: SemanticModelGeneralization[], generalizationOptions?: LayoutOptions): Array<ElkNode> {
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

        const subgraphs: string[][] = this.findGeneralizationSubgraphs(parents, children);
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
            createdSubgraphs.push(this.createElkSubgraphFromNodesAndInsertToElkGraph(graph, subg, generalizationOptions));
        });


        return createdSubgraphs;
    }


    /**
     * @deprecated
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


    /**
     * @returns Array with 4 ports, one for each side.
     * The ports have id created from the given {@link id}, which should be the id of the node, which will use the ports.
     */
    createDefaultPorts(id: string): ElkPort[] {
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


    /**
     *
     * @returns default layout options which will be inserted to node.
     */
    getDefaultLayoutOptionsForNode() {
        const portOptions = {
            // "portConstraints": "FIXED_SIDE",        // TODO: !!! Actually disabling this really improves the layouted graphs (but they are much more compact)
            "nodeLabels.placement": "[H_LEFT, V_TOP, OUTSIDE]",

            // TODO: !!! It actually works better without CENTERING (at least I think - should test it again properly)
            // "org.eclipse.elk.portAlignment.default": "CENTER",      // Put all to center, can also specify based on side (north, west, east, south), ie.
            // "org.eclipse.elk.portAlignment.north": "BEGIN",         // But the actual side is based on the direction of layout alg!!!!!
        };

        return portOptions;
    }


    // TODO: I should have boolean option which says if I should use the position or not and set it always if the position of entity in the source graph is set.
    //       and update method docs based on it
    // TODO: As I said earlier, maybe I should compute the width and height once I am creating the graph not when I am converting to the library representation
    /**
     * Creates node in the ELK library representation (type {@link ElkNode}) based on given data.
     */
    createElkNode(
        id: string,
        constraintContainer: ElkConstraintContainer,
        graphNode: EdgeEndPoint,
        parentElkNode?: ElkNode,
        shouldComputeSize?: boolean,
        label?: string
    ): ElkNode {
        const width: number = shouldComputeSize ? graphNode?.completeVisualNode?.width : ReactflowDimensionsConstantEstimator.getDefaultWidth();
        const height: number = shouldComputeSize ? graphNode?.completeVisualNode?.height : ReactflowDimensionsConstantEstimator.getDefaultHeight();

        // TODO: This if can be removed later
        if(graphNode?.completeVisualNode?.width === undefined) {
            throw new Error("Something wrong, the width and height should be always present on graph node");
        }


        const ports: ElkPort[] = this.createDefaultPorts(id);
        const portOptions = this.getDefaultLayoutOptionsForNode();


        const nodeLabel: ElkLabel = { text: label === undefined ? id : label };
        const layoutOptions = this.convertLayoutOptionsToElkLayoutOptions(graphNode.layoutOptions);
        const node: ElkNode = {
            id: id,
            labels: [ nodeLabel ],
            width: width,
            height: height,
            // ports: ports,
            layoutOptions: {
                ...portOptions,
                ...layoutOptions
            },
        };

        if(parentElkNode !== undefined && parentElkNode.id.startsWith("subgraph")) {
            console.info("parentElkNode.id.startsWith(subgraph)");
            console.info({...node});
            console.info({...parentElkNode});
            console.info(parentElkNode);
            console.info(parentElkNode.width);
        }

        const position = graphNode?.completeVisualNode?.coreVisualNode?.position;
        // TODO: Still touching the data and I would like to have more than 1 algorithm in future for example in the "ALL" bracket
        const isInteractiveGeneralization = constraintContainer?.currentLayoutAction?.action?.constraintedNodes === "GENERALIZATION" &&
            String(constraintContainer?.currentLayoutAction?.action?.data?.["interactive"]) === "true" &&
            !isSubgraph(this.graph, node);
        const isInteractiveAll =  constraintContainer?.currentLayoutAction.action.constraintedNodes === "ALL" &&
            String(constraintContainer?.currentLayoutAction?.action?.data?.["interactive"]) === "true" &&
            ((constraintContainer.isGeneralizationPerformedBefore() && isSubgraph(this.graph, node)) ||
                !constraintContainer.isGeneralizationPerformedBefore());
        const isInteractiveGeneralizationSubgraphs = constraintContainer?.currentLayoutAction.action.constraintedNodes === "ALL" &&
            constraintContainer.isGeneralizationPerformedBefore() && !isSubgraph(this.graph, node);


        const hasParentGraphFixedLayout = parentElkNode !== undefined;

        if(position !== undefined &&
            (isInteractiveGeneralization || isInteractiveAll || isInteractiveGeneralizationSubgraphs || hasParentGraphFixedLayout)
          ) {
            const parentPosition = graphNode.getSourceGraph()?.completeVisualNode?.coreVisualNode?.position;
            node.x = position.x - (parentPosition?.x ?? 0);
            node.y = position.y - (parentPosition?.y ?? 0);
            if((constraintContainer.currentLayoutAction?.action as (IAlgorithmConfiguration & ElkConstraint))?.algorithmName === "elk_stress") {
                node.layoutOptions["org.eclipse.elk.stress.fixed"] = graphNode.completeVisualNode.isAnchored.toString();
            }
        }

        return node;
    }
}


/**
 * Runs the second part of generalization two run layout. The first part is layout of the internals of subgraphs. The second part, which is performed in this method is
 * the positioning of the subgraphs.
 */
async function performSecondPartGeneralizationTwoRunLayout(graph: IGraphClassic, graphInElk: ElkNode, elk): Promise<ElkNode | void> {
    for(const subgraph of graphInElk.children) {
        if(isSubgraph(graph, subgraph)) {
            // TODO: Actually I don't think this is needed
            fixNodesInsideGraph(subgraph);
        }
    }

    const layoutPromise = elk.layout(graphInElk)
                             .catch(console.error);
    layoutPromise.then(result => console.log("!!! performGeneralizationTwoRunLayout LAYOUTING OVER !!!"));
    layoutPromise.then(console.log);
    layoutPromise.then(result => console.log(JSON.stringify(result)));
    return layoutPromise;
}


/**
 * Fixes nodes in {@link graph} so they are not layouted (their relative positioning within the subgraph is kept) when we are deciding the
 * positioning of the subgraphs in the {@link performSecondPartGeneralizationTwoRunLayout}
 */
function fixNodesInsideGraph(graph: ElkNode) {
    graph.layoutOptions = {};
    graph.layoutOptions['elk.algorithm'] = 'fixed';
}


/**
 * Removes edges where either the target or source is the given {@link subgraph}
 * @returns The kept edges and the removed edges ... in this order
 */
function removeEdgesLeadingToSubgraphInsideSubgraph(subgraph: ElkNode): [ElkExtendedEdge[], ElkExtendedEdge[]] {
    const keptEdges: ElkExtendedEdge[] = [];
    const removedEdges: ElkExtendedEdge[] = [];
    for(const e of subgraph.edges) {
        // TODO: Version without ports (the commented code is version with ports)
        // TODO: The stress algorithm can't work with ports, well it can but the edges aren't set correctly
        // if(convertNodePortIdToId(e.sources[0]) === subgraph.id || convertNodePortIdToId(e.targets[0]) === subgraph.id) {
        if(e.sources[0] === subgraph.id || e.targets[0] === subgraph.id) {
            removedEdges.push(e);
        }
        else {
            keptEdges.push(e);
        }
    }

    return [keptEdges, removedEdges];
}


function convertNodePortIdToNodeId(id: string): string {
    return id.slice(2);
}


function isSubgraph(graph: IGraphClassic, subgraph: ElkNode): boolean {
    const nodeInGraph = graph.nodes[subgraph.id];
    const isSubgraphTest = nodeInGraph !== undefined && ("nodes" in nodeInGraph);

    return isSubgraphTest;
}

/**
 * @deprecated
 */
function isSubgraphID(id: string): boolean {
    return id.startsWith("subgraph");
}


/**
 * Class which handles the act of layouting within the ELK layouting library. For more info check docs of {@link LayoutAlgorithm} interface, which this class implements.
 */
export class ElkLayout implements LayoutAlgorithm {
    constructor() {
        this.elk = new ELK();
    }

    /**
     * @deprecated
     */
    prepare(extractedModels: ExtractedModels, constraintContainer: ElkConstraintContainer, nodeDimensionQueryHandler: NodeDimensionQueryHandler): void {
        // TODO: Deprecated ... and from now it will actually stop working
        // this.elkGraphTransformer = new ElkGraphTransformer(GraphFactory.createMainGraph(null, extractedModels, null, null), constraintContainer);
        // this.graphInElk = this.elkGraphTransformer.convertToLibraryRepresentation(extractedModels, constraintContainer);
        // this.constraintContainer = constraintContainer;
        // // this.nodeDimensionQueryHandler = nodeDimensionQueryHandler;
    }

    // TODO RadStr: Just put everywhere main graph and be done with it
    prepareFromGraph(graph: IGraphClassic, constraintContainer: ElkConstraintContainer): void {
        // TODO RadStr: Debugging
        // GraphAlgorithms.findLeafPaths(graph.mainGraph);
        GraphAlgorithms.dcatAPTestSetterHardcoded(graph.mainGraph);

        this.graph = graph
        this.elkGraphTransformer = new ElkGraphTransformer(graph, constraintContainer);
        this.graphInElk = this.elkGraphTransformer.convertGraphToLibraryRepresentation(graph, true, constraintContainer),       // TODO: Why I need to pass the constraintContainer again???
        this.constraintContainer = constraintContainer;
    }

    async run(shouldCreateNewGraph: boolean): Promise<IMainGraphClassic> {
        let layoutPromise: Promise<ElkNode | void>;
        const graphInElkWorkCopy = this.getGraphInElk();
        if(this.constraintContainer.isGeneralizationPerformedBefore()) {
            layoutPromise = performSecondPartGeneralizationTwoRunLayout(this.graph, graphInElkWorkCopy, this.elk);
        }
        else {
            // throw new Error("TODO: Radial debug");
            layoutPromise = this.elk.layout(graphInElkWorkCopy)
                                    .catch(console.error);
        }

        console.log("elkGraph layouted");
        console.log({...graphInElkWorkCopy});


        return layoutPromise.then(layoutedGraph => {
            if(shouldCreateNewGraph) {
                // TODO: Check if the graph is void or not - Maybe can be solved better
                if(layoutedGraph !== null && typeof layoutedGraph === 'object') {
                    return this.elkGraphTransformer.convertLibraryToGraphRepresentation(layoutedGraph, false);
                }
                return this.elkGraphTransformer.convertLibraryToGraphRepresentation(null, false);
            }
            else {
                this.elkGraphTransformer.updateExistingGraphRepresentationBasedOnLibraryRepresentation(graphInElkWorkCopy, this.graph, false, true);
                return this.graph.mainGraph;            // TODO: Again main graph
            }
        });
    }

    async runGeneralizationLayout(shouldCreateNewGraph: boolean): Promise<IMainGraphClassic> {
        const layoutPromises: Promise<void>[] = [];
        let subgraphAllEdges: [ElkExtendedEdge[], ElkExtendedEdge[]][] = [];
        let subgraphIndices: number[] = [];

        const graphInElkWorkCopy = this.getGraphInElk();
        console.log("GRAPH BEFORE DOUBLE LAYOUTING:");
        console.log(JSON.stringify(graphInElkWorkCopy));
        for(const [index, subgraph] of graphInElkWorkCopy.children.entries()) {
            console.log(index);
            console.log(subgraph);
            if(isSubgraph(this.graph, subgraph)) {
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
                const layoutPromise = this.elk.layout(subgraph)
                    .then(console.log)
                    .catch(console.error);
                await layoutPromise;            // TODO: Just debug
                layoutPromises.push(layoutPromise);
            }
        }
        return Promise.all(layoutPromises).then(result => {
            console.log("GRAPH AFTER FIRST LAYOUTING:");
            console.log(JSON.stringify(graphInElkWorkCopy));
            for(const [i, [keptEdges, removedEdges]] of subgraphAllEdges.entries()) {
                console.log("Layouted subgraph");
                console.log(graphInElkWorkCopy.children[subgraphIndices[i]]);
                graphInElkWorkCopy.children[subgraphIndices[i]].edges = graphInElkWorkCopy.children[subgraphIndices[i]].edges.concat(removedEdges);
            }
            console.log("GRAPH AFTER FIRST LAYOUTING AND REPAIRING EDGES:");
            console.log(graphInElkWorkCopy);
            console.log(JSON.stringify(graphInElkWorkCopy));
            if(shouldCreateNewGraph) {
                const layoutedGraph = this.elkGraphTransformer.convertLibraryToGraphRepresentation(graphInElkWorkCopy, false);
                // TODO: Alternative solution is just to keep changing the input graph instead of creating copies
                return layoutedGraph;
            }
            else {
                this.elkGraphTransformer.updateExistingGraphRepresentationBasedOnLibraryRepresentation(graphInElkWorkCopy, this.graph, false, true);
                return this.graph.mainGraph;            // TODO: Again main graph
            }
        });
    }


    stop(): void {
        throw new Error("TODO: Implement me if you want webworkers and parallelization ... actually nevermind this should be one level up");
    }

    private elk: ELKType;
    private graph: IGraphClassic;
    private graphInElk: ElkNode;
    private getGraphInElk(): ElkNode {
        return _.cloneDeep(this.graphInElk);
    }
    constraintContainer: ConstraintContainer;
    private elkGraphTransformer: ElkGraphTransformer;
}
