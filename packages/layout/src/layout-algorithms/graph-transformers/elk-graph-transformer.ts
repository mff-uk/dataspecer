import { isVisualProfileRelationship, isVisualRelationship, Position, VisualNode, VisualProfileRelationship, VisualRelationship } from "@dataspecer/core-v2/visual-model";
import { AlgorithmConfiguration, UserGivenAlgorithmConfigurationBase } from "../../configs/constraints";
import { ElkConstraint } from "../../configs/elk/elk-constraints";
import { VisualNodeComplete } from "../../graph/representation/node";
import { GraphTransformer } from "./graph-transformer-interface";
import { DefaultGraph, DefaultMainGraph, Graph, isSubgraph, MainGraph } from "../../graph/representation/graph";
import { ElkExtendedEdge, ElkLabel, ElkNode, ElkPort } from "elkjs";
import { ElkConstraintContainer } from "../../configs/constraint-container";
import { CONFIG_TO_ELK_CONFIG_MAP } from "../../configs/elk/elk-utils";
import { ReactflowDimensionsConstantEstimator, XY } from "../..";
import { VisualEntities } from "../../migration-to-cme-v2";
import { EdgeEndPoint } from "../../graph/representation/edge";
import _ from "lodash";
import { SemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { PhantomElementsFactory } from "../../util/utils";

type VisualEntitiesType = (VisualNodeComplete | VisualRelationship | VisualProfileRelationship)[];

/**
 * The Transformer class for conversion between our graph representation and ELK graph representation. For more info check {@link GraphTransformer} docs.
 */
export class ElkGraphTransformer implements GraphTransformer {
    constructor(graph: Graph, options?: object) {
        this.mainGraph = graph.mainGraph;
    }

    convertGraphToLibraryRepresentation(
        graph: Graph,
        shouldSetLayoutOptions: boolean,
        constraintContainer: ElkConstraintContainer,
        elkNodeToSet?: ElkNode
    ): ElkNode {
        return this.convertGraphToLibraryRepresentationInternal(graph, shouldSetLayoutOptions, constraintContainer, elkNodeToSet);
    }

    convertLayoutOptionsToElkLayoutOptions(
        layoutOptions: Record<string, string>,
    ) {
        const elkLayoutOptions: Record<string, string> = {};
        Object.entries(layoutOptions).forEach(([key, value]) => {
            if(CONFIG_TO_ELK_CONFIG_MAP[key] === undefined || CONFIG_TO_ELK_CONFIG_MAP[key] === null) {
                elkLayoutOptions[key] = value;
            }
            else {
                for (const elkKey of CONFIG_TO_ELK_CONFIG_MAP[key]) {
                    elkLayoutOptions[elkKey] = value;
                }
            }
        });
        return Object.values(elkLayoutOptions).length === 0 ? undefined : elkLayoutOptions;
    }

    /**
     * Internal function for conversion from our graph representation to ELK representation. The method is called recursively for subgraphs.
     */
    convertGraphToLibraryRepresentationInternal(
        graph: Graph,
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
                return this.createElkNode(
                    id, constraintContainer, node, elkNodeToSet, true,
                    "PROFILE OF: " + (node.semanticEntityRepresentingNode as SemanticModelClassProfile)?.profiling);
            }
            else {
                const elkNode = this.createElkNode(
                    id, constraintContainer, node, elkNodeToSet, true, node?.semanticEntityRepresentingNode?.iri);
                if(node instanceof DefaultGraph) {
                    this.convertGraphToLibraryRepresentationInternal(node, true, constraintContainer, elkNode);
                }
                return elkNode;
            }
        }).filter(n => n !== null);

        const edges = [];

        Object.entries(graph.nodes).map(([id, node]) => {
            // TODO RadStr: Remove the commented code after debugging visual model
            // console.log("node");
            // console.log(node);
            // console.log(node.getAllOutgoingEdges());
            for(const edge of node.getAllOutgoingEdges()) {
                if(edge.isConsideredInLayout === false) {
                    continue;
                }


                // TODO RadStr: Remove the commented code after debugging visual model
                // console.log("Created edge:");
                // console.log("START:");
                // console.log(edge.start.node?.iri ?? edge.start.id);
                // console.log("END:");
                // console.log(edge.end.node?.iri ?? edge.end.id);

                const source = edge.reverseInLayout === false ? edge.start.id : edge.end.id;
                const target = edge.reverseInLayout === false ? edge.end.id : edge.start.id;

                const layoutOptions = this.convertLayoutOptionsToElkLayoutOptions(edge.layoutOptions);
                let elkEdge: ElkExtendedEdge = {
                    id: edge.id,
                    sources: [ source ],
                    targets: [ target ],
                    layoutOptions,
                }
                edges.push(elkEdge);
            }
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
            if((constraintContainer.currentLayoutAction.action.affectedNodes === "GENERALIZATION" && isSubgraph(this.mainGraph, elkGraph.id)) ||
                (constraintContainer.currentLayoutAction.action.affectedNodes === "ALL" && (graph instanceof DefaultMainGraph))) {
                elkGraph.layoutOptions = (constraintContainer.currentLayoutAction.action as (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase> & ElkConstraint)).elkData;
            }
            else if(isSubgraph(this.mainGraph, elkGraph.id)) {
                const nodesInOriginalGraph = Object.values(graph.nodes);
                let isAnchored = false;
                if(nodesInOriginalGraph.length > 0) {
                    isAnchored = nodesInOriginalGraph[0].completeVisualNode.isAnchored;
                }
                elkGraph.layoutOptions = {
                    "algorithm": "fixed",
                    "org.eclipse.elk.stress.fixed": String(isAnchored),
                };
            }
        }

        console.log("elkGraph after conversion");
        console.log(_.cloneDeep(elkGraph));

        return elkGraph;
    }

    private approximatelyEqual(xy1: XY, xy2: XY, epsilon: number = 0.001) {
        return Math.abs(xy1.x - xy2.x) < epsilon && Math.abs(xy1.y - xy2.y) < epsilon ;
    }

    updateExistingGraphRepresentationBasedOnLibraryRepresentation(
        libraryRepresentation: ElkNode | null,
        graphToBeUpdated: Graph,
        includeNewVertices: boolean,
        shouldUpdateEdges: boolean
    ): VisualEntities {
        if(libraryRepresentation === null) {
            console.error("Update of existing graph representation based on elk represetantion failed, " +
                          "because given library representation is not defined")
            return {};
        }

        const anchoredNode = this.findAnchoredNodeWithUnchanchoredEnd(graphToBeUpdated);
        const tmpPos = anchoredNode?.completeVisualNode?.coreVisualNode?.position ?? {x: 0, y: 0};
        const anchoredPositionBeforeLayout: XY = {...tmpPos};

        const visualEntities = this.recursivelyUpdateGraphBasedOnElkNode(libraryRepresentation, graphToBeUpdated, 0, 0, shouldUpdateEdges);
        // Note: Previously we were moving the graph to the origin point [0, 0], but that is sometimes unwanted
        //       For example when using the elk.stress algorithm to find position for 1 element, then
        //       we don't want to move everything, but just the 1 node. So either

        let positionShiftDueToAnchors: XY = {x: 0, y: 0};
        if(anchoredNode !== null) {
            positionShiftDueToAnchors.x = anchoredNode.completeVisualNode.coreVisualNode.position.x - anchoredPositionBeforeLayout.x;
            positionShiftDueToAnchors.y = anchoredNode.completeVisualNode.coreVisualNode.position.y - anchoredPositionBeforeLayout.y;
        }

        visualEntities.forEach(visualEntity => {
            if(DefaultGraph.isVisualNodeComplete(visualEntity)) {
                visualEntity.addToPositionInCoreVisualNode(-positionShiftDueToAnchors.x, -positionShiftDueToAnchors.y);
            }
            else if(isVisualRelationship(visualEntity) || isVisualProfileRelationship(visualEntity)) {
                for(let i = 0; i < visualEntity.waypoints.length; i++) {
                    visualEntity.waypoints[i].x -= positionShiftDueToAnchors.x;
                    visualEntity.waypoints[i].y -= positionShiftDueToAnchors.y;
                }
            }
        });

        console.warn("Positions after performing anchor shift");
        console.warn(JSON.stringify(Object.values(visualEntities).filter(DefaultGraph.isVisualNodeComplete).map(n => [n.coreVisualNode.representedEntity, n.coreVisualNode.position])));


        return Object.fromEntries(visualEntities.map(visualEntity => {
            if(DefaultGraph.isVisualNodeComplete(visualEntity)) {
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


    /**
     * Recursively updates {@link graphToBeUpdated} based on positions in {@link elkNode}.
     */
    recursivelyUpdateGraphBasedOnElkNode(elkNode: ElkNode, graphToBeUpdated: Graph, referenceX: number, referenceY: number, shouldUpdateEdges: boolean): VisualEntitiesType {
        let visualEntities : VisualEntitiesType = [];
        // TODO RadStr: Debug prints, just remove later
        console.info("referenceX");
        console.info({...elkNode});
        console.info(elkNode);
        console.info(referenceX);
        console.info(referenceY);

        console.info("graphToBeUpdated.mainGraph", graphToBeUpdated.mainGraph);

        for(let ch of elkNode.children) {
            const newPosition = this.convertElkNodeToPosition(ch, referenceX, referenceY);
            const node = graphToBeUpdated.mainGraph.findNodeInAllNodes(ch.id);
            node.completeVisualNode.coreVisualNode.position = {
                ...newPosition,
                anchored: node.completeVisualNode.coreVisualNode.position.anchored,
            };

            visualEntities.push(node.completeVisualNode);

            if(isSubgraph(this.mainGraph, ch.id)) {
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
                if(edgeInGraph?.reverseInLayout === true) {
                    waypoints.reverse();
                }
                edgeInGraph.visualEdge.visualEdge.waypoints = waypoints;
                visualEntities.push(edgeInGraph.visualEdge.visualEdge);
            }
        }
        return visualEntities;
    };

    private mainGraph: MainGraph;

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
    private findAnchoredNodeWithUnchanchoredEnd(graph: Graph): EdgeEndPoint | null {
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


    // TODO: Maybe the referenceX and referenceY have to be also used for edges in case of subgraphs (in same way as for nodes)
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


    /**
     * @deprecated I used it for some experimentation with ports, but left the idea do to complexness and no gain, keeping it deprectaed
     * instead of removing it. But free to remove
     * @returns Array with 4 ports, one for each side.
     * The ports have id created from the given {@link id}, which should be the id of the node, which will use the ports.
     */
    createDefaultPorts(id: string): ElkPort[] {
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
            "nodeLabels.placement": "[H_LEFT, V_TOP, OUTSIDE]",

            // Some commented code with experiments, but in the end it was the best to just use the basic ones
            // "portConstraints": "FIXED_SIDE",        // Actually disabling this really improves the layouted graphs (but they are much more compact)
            // "org.eclipse.elk.portAlignment.default": "CENTER",      // Put all to center, can also specify based on side (north, west, east, south), ie.
            // "org.eclipse.elk.portAlignment.north": "BEGIN",         // But the actual side is based on the direction of layout alg!
        };

        return portOptions;
    }

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

        if(graphNode?.completeVisualNode?.width === undefined) {
            throw new Error("Something wrong, the width and height should be always present on graph node");
        }

        const portOptions = this.getDefaultLayoutOptionsForNode();

        const nodeLabel: ElkLabel = { text: label === undefined ? id : label };
        const layoutOptions = this.convertLayoutOptionsToElkLayoutOptions(graphNode.layoutOptions);
        const node: ElkNode = {
            id: id,
            labels: [ nodeLabel ],
            width: width,
            height: height,
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

        const isNodeSubgraph = isSubgraph(this.mainGraph, node.id);
        const position = graphNode?.completeVisualNode?.coreVisualNode?.position;
        const isInteractiveGeneralization = constraintContainer?.currentLayoutAction?.action?.affectedNodes === "GENERALIZATION" &&
            String(constraintContainer?.currentLayoutAction?.action?.data?.["interactive"]) === "true" &&
            !isNodeSubgraph;
        const isInteractiveAll = constraintContainer?.currentLayoutAction.action.affectedNodes === "ALL" &&
            String(constraintContainer?.currentLayoutAction?.action?.data?.["interactive"]) === "true" &&
            ((constraintContainer.isGeneralizationPerformedBefore() && isNodeSubgraph) ||
                !constraintContainer.isGeneralizationPerformedBefore());
        const isInteractiveGeneralizationSubgraphs = constraintContainer?.currentLayoutAction.action.affectedNodes === "ALL" &&
            constraintContainer.isGeneralizationPerformedBefore() && !isNodeSubgraph;


        const hasParentGraphFixedLayout = parentElkNode !== undefined;

        if(position !== undefined &&
            (isInteractiveGeneralization || isInteractiveAll || isInteractiveGeneralizationSubgraphs || hasParentGraphFixedLayout)
          ) {
            const parentPosition = graphNode.getSourceGraph()?.completeVisualNode?.coreVisualNode?.position;
            node.x = position.x - (parentPosition?.x ?? 0);
            node.y = position.y - (parentPosition?.y ?? 0);
            if((constraintContainer.currentLayoutAction?.action as (AlgorithmConfiguration<UserGivenAlgorithmConfigurationBase>))?.data.layout_alg === "elk_stress") {
                node.layoutOptions["org.eclipse.elk.stress.fixed"] = graphNode.completeVisualNode.isAnchored.toString();
            }
        }

        return node;
    }
}