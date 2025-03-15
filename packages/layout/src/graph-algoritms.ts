import { Direction, ReactflowDimensionsConstantEstimator } from ".";
import {
  GraphClassic,
  IGraphClassic,
  IMainGraphClassic,
} from "./graph/representation/graph";
import { EdgeNodeCrossingMetric } from "./graph/graph-metrics/implemented-metrics/edge-node-crossing";
import { addToRecordArray } from "./util/utils";
import { INodeClassic, NodeClassic, VisualNodeComplete } from "./graph/representation/node";
import { EdgeClassic, EdgeEndPoint, IEdgeClassic } from "./graph/representation/edge";

export enum ToConsiderFilter {
  OnlyLayouted,
  OnlyNotLayouted,
  All,
}

type Dimensions = {
    width: number,
    height: number
};

type RootHeuristicType = "MOST_EDGES";

export class GraphAlgorithms {
    static dfs(graph: GraphClassic, root: string, edgeType: "TODO" | "GENERALIZATION"): string[] {
        throw new Error("Unimplemented");
    }
    static bfs(graph: GraphClassic, root: string, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    static findStrongComponents(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    static findWeakComponents(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    static computeJacardSimilarity(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    static findLeaves(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION"): string[] {
        throw new Error("Unimplemented");
    }


    // TODO RadStr: ...... Trying stuff
    // TODO RadStr: ...... Trying stuff

    // TODO RadStr: Debugs
    static currentDCATAPTestEdgeLen = 250;
    static moveTestEdgeLenOneUp() {
      console.info("GraphAlgorithms.currentDCATAPTestEdgeLen", GraphAlgorithms.currentDCATAPTestEdgeLen, GraphAlgorithms.currentDCATAPTestEdgeLen.toString());
      GraphAlgorithms.currentDCATAPTestEdgeLen += 50;
      if(GraphAlgorithms.currentDCATAPTestEdgeLen === 300) {
        GraphAlgorithms.currentDCATAPTestEdgeLen = 250;
      }
    }
    static dcatAPTestSetter(
      graph: IMainGraphClassic
    ): void {
      const leafs: Record<string, IEdgeClassic[]> = {};
      const clusters: Record<string, IEdgeClassic[]> = {};
      graph.allNodes.forEach(node => {
        const edges = [...node.getAllEdges()];
        let secondEnd: string | null = null;
        let isSameEndForAllEdges = true;
        for(const edge of node.getAllOutgoingEdges()) {
          if(secondEnd === null) {
            secondEnd = edge.end.id;
          }
          if(secondEnd !== edge.end.id) {
            isSameEndForAllEdges = false;
            break;
          }
        }
        if(isSameEndForAllEdges) {
          for(const edge of node.getAllIncomingEdges()) {
            if(secondEnd === null) {
              secondEnd = edge.start.id;
            }
            if(secondEnd !== edge.start.id) {
              isSameEndForAllEdges = false;
              break;
            }
          }

          if(isSameEndForAllEdges) {
            for(const edge of edges) {
              addToRecordArray(node.id, edge, leafs);
              const otherEnd = edge.start.id === node.id ? edge.end : edge.start;
              addToRecordArray(otherEnd.id, edge, clusters);
              edge.layoutOptions["stress_edge_len"] = GraphAlgorithms.currentDCATAPTestEdgeLen.toString();
            }
          }
        }
      });
    }

    static dcatAPTestSetterHardcoded(
      graph: IMainGraphClassic
    ): void {
      const leafs: Record<string, IEdgeClassic[]> = {};
      const clusters: Record<string, IEdgeClassic[]> = {};
      graph.allNodes.forEach(node => {
        const edges = [...node.getAllEdges()];
        let secondEnd: string | null = null;
        let isSameEndForAllEdges = true;
        for(const edge of node.getAllOutgoingEdges()) {
          if(secondEnd === null) {
            secondEnd = edge.end.id;
          }
          if(secondEnd !== edge.end.id) {
            isSameEndForAllEdges = false;
            break;
          }
        }
        if(isSameEndForAllEdges) {
          for(const edge of node.getAllIncomingEdges()) {
            if(secondEnd === null) {
              secondEnd = edge.start.id;
            }
            if(secondEnd !== edge.start.id) {
              isSameEndForAllEdges = false;
              break;
            }
          }

          if(isSameEndForAllEdges) {
            for(const edge of edges) {
              addToRecordArray(node.id, edge, leafs);
              const otherEnd = edge.start.id === node.id ? edge.end : edge.start;
              addToRecordArray(otherEnd.id, edge, clusters);
              edge.layoutOptions["stress_edge_len"] = GraphAlgorithms.currentDCATAPTestEdgeLen.toString();
            }
          }
        }
      });

      graph.allEdges.forEach(edge => {
        if(edge.semanticEntityRepresentingEdge === null) {
          return;
        }
        if(edge.semanticEntityRepresentingEdge.id === "https://mff-uk.github.io/specifications/dcat-dap/#CataloguedResource.qualifiedRelation" ||
            edge.semanticEntityRepresentingEdge.id === "https://mff-uk.github.io/specifications/dcat-dap/#CataloguedResource.qualifiedAttribution" ||
            edge.semanticEntityRepresentingEdge.id === "https://mff-uk.github.io/specifications/dcat-dap/#Relationship.hadRole" ||
            edge.semanticEntityRepresentingEdge.id === "https://mff-uk.github.io/specifications/dcat-dap/#Attribution.hadRole" ||

            edge.semanticEntityRepresentingEdge.id === "https://mff-uk.github.io/specifications/dcat-dap/#Dataset.temporalCoverage" ||
            edge.semanticEntityRepresentingEdge.id === "https://mff-uk.github.io/specifications/dcat-dap/#PeriodOfTime.end" ||

            edge.semanticEntityRepresentingEdge.id === "https://mff-uk.github.io/specifications/dcat-dap/#Dataset.spatial-geographicalCoverage" ||
            edge.semanticEntityRepresentingEdge.id === "https://mff-uk.github.io/specifications/dcat-dap/#Location.geometry" ||

            edge.semanticEntityRepresentingEdge.id === "https://mff-uk.github.io/specifications/dcat-dap/#Distribution.checksum" ||
            edge.semanticEntityRepresentingEdge.id === "https://mff-uk.github.io/specifications/dcat-dap/#Checksum.algorithm"
        ) {
          edge.layoutOptions["stress_edge_len"] = GraphAlgorithms.currentDCATAPTestEdgeLen.toString();
        }
      });
    }

    /**
     * Returns leafs paths - for example when we have node which has leafs around it and some non-leafs but those non-leafs are only paths
     */
    static findLeafPaths(
      graph: IMainGraphClassic
    ): void {
      const leafs: Record<string, IEdgeClassic[]> = {};
      const clusters: Record<string, IEdgeClassic[]> = {};
      graph.allNodes.forEach(node => {
        const edges = [...node.getAllEdges()];
        let secondEnd: string | null = null;
        let isSameEndForAllEdges = true;
        for(const edge of node.getAllOutgoingEdges()) {
          if(secondEnd === null) {
            secondEnd = edge.end.id;
          }
          if(secondEnd !== edge.end.id) {
            isSameEndForAllEdges = false;
            break;
          }
        }
        if(isSameEndForAllEdges) {
          for(const edge of node.getAllIncomingEdges()) {
            if(secondEnd === null) {
              secondEnd = edge.start.id;
            }
            if(secondEnd !== edge.start.id) {
              isSameEndForAllEdges = false;
              break;
            }
          }

          if(isSameEndForAllEdges) {
            for(const edge of edges) {
              addToRecordArray(node.id, edge, leafs);
              const otherEnd = edge.start.id === node.id ? edge.end : edge.start;
              addToRecordArray(otherEnd.id, edge, clusters);
              edge.layoutOptions["stress_edge_len"] = "250";
            }
          }
        }
      });
    }


    static clusterify(graph: IMainGraphClassic): Record<string, IEdgeClassic[]> {
      const leafs: Record<string, IEdgeClassic[]> = {};
      const clusters: Record<string, IEdgeClassic[]> = {};
      const uniqueClusters: Record<string, IEdgeClassic[]> = {};    // Clusters without multi-edges - we just take 1 representative
      graph.allNodes.forEach(node => {
        const edges = [...node.getAllEdges()];
        let secondEnd: string | null = null;
        let isSameEndForAllEdges = true;
        for(const edge of node.getAllOutgoingEdges()) {
          if(secondEnd === null) {
            secondEnd = edge.end.id;
          }
          if(secondEnd !== edge.end.id) {
            isSameEndForAllEdges = false;
            break;
          }
        }
        if(isSameEndForAllEdges) {
          for(const edge of node.getAllIncomingEdges()) {
            if(secondEnd === null) {
              secondEnd = edge.start.id;
            }
            if(secondEnd !== edge.start.id) {
              isSameEndForAllEdges = false;
              break;
            }
          }

          if(isSameEndForAllEdges) {
            let isFirst = true;
            for(const edge of edges) {
              addToRecordArray(node.id, edge, leafs);
              const otherEnd = edge.start.id === node.id ? edge.end : edge.start;
              addToRecordArray(otherEnd.id, edge, clusters);
              if(isFirst) {
                isFirst = false;
                addToRecordArray(otherEnd.id, edge, uniqueClusters);
              }
              // TODO RadStr: Commented code
              // edge.layoutOptions["stress_edge_len"] = "250";
            }
          }
        }
      });

      const sortedClusters = Object.entries(uniqueClusters)
        .sort(([, edgesA], [, edgesB]) => edgesB.length - edgesA.length);
      const biggestClusters = sortedClusters.splice(0, 3);
      return {
        [biggestClusters[0][0]]: biggestClusters[0][1],
        [biggestClusters[1][0]]: biggestClusters[1][1],
        [biggestClusters[2][0]]: biggestClusters[2][1],
      };
    }


    // TODO: We could also put how many nodes collide into the computation
    /**
     * Finds how many edges collide with the bounding box, which is placed - above, below, to the left and to the right of given {@link rootNode}.
     */
    static findSectorNodePopulationUsingBoundingBox(
      graph: IMainGraphClassic,
      rootNode: EdgeEndPoint,
      edgesToConsider: ToConsiderFilter,
    ): Record<Direction, number> {
      const populations: Record<Direction, number> = {
        [Direction.Up]: 0,
        [Direction.Right]: 0,
        [Direction.Down]: 0,
        [Direction.Left]: 0
      };

      const boundingBoxes: Record<Direction, VisualNodeComplete> = {
        [Direction.Left]: undefined,
        [Direction.Right]: undefined,
        [Direction.Up]: undefined,
        [Direction.Down]: undefined,
      };

      const widthMultipleForHorizontalDirection = 3;
      const heightMultipleForHorizontalDirection = 20;
      const widthMultipleForVerticalDirection = 8;
      const heightMultipleForVerticalDirection = 6;


      let boundingBoxWidth = widthMultipleForHorizontalDirection * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      let boundingBoxHeight = heightMultipleForHorizontalDirection * ReactflowDimensionsConstantEstimator.getDefaultHeight();

      let boundingBoxVisualNode = NodeClassic.createNewVisualNodeBasedOnSemanticData(null, "", null);
      let boundingBoxVisualNodeComplete = new VisualNodeComplete(
        boundingBoxVisualNode, boundingBoxWidth, boundingBoxHeight, false, false, false);
      boundingBoxVisualNodeComplete.coreVisualNode.position.x = rootNode.completeVisualNode.coreVisualNode.position.x - boundingBoxWidth;
      boundingBoxVisualNodeComplete.coreVisualNode.position.y = rootNode.completeVisualNode.coreVisualNode.position.y - boundingBoxHeight / 2;
      boundingBoxes[Direction.Left] = boundingBoxVisualNodeComplete;

      boundingBoxVisualNode = NodeClassic.createNewVisualNodeBasedOnSemanticData(null, "", null);
      boundingBoxVisualNodeComplete = new VisualNodeComplete(
        boundingBoxVisualNode, boundingBoxWidth, boundingBoxHeight, false, false, false);
      boundingBoxVisualNodeComplete.coreVisualNode.position.x = rootNode.completeVisualNode.coreVisualNode.position.x +
                                                                rootNode.completeVisualNode.width;
      boundingBoxVisualNodeComplete.coreVisualNode.position.y = rootNode.completeVisualNode.coreVisualNode.position.y - boundingBoxHeight / 2;
      boundingBoxes[Direction.Right] = boundingBoxVisualNodeComplete;


      boundingBoxWidth = widthMultipleForVerticalDirection * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      boundingBoxHeight = heightMultipleForVerticalDirection * ReactflowDimensionsConstantEstimator.getDefaultHeight();
      boundingBoxVisualNode = NodeClassic.createNewVisualNodeBasedOnSemanticData(null, "", null);
      boundingBoxVisualNodeComplete = new VisualNodeComplete(
        boundingBoxVisualNode, boundingBoxWidth, boundingBoxHeight, false, false, false);
      boundingBoxVisualNodeComplete.coreVisualNode.position.x = rootNode.completeVisualNode.coreVisualNode.position.x - boundingBoxWidth / 2;
      boundingBoxVisualNodeComplete.coreVisualNode.position.y = rootNode.completeVisualNode.coreVisualNode.position.y - boundingBoxHeight;
      boundingBoxes[Direction.Up] = boundingBoxVisualNodeComplete;

      boundingBoxWidth = widthMultipleForVerticalDirection * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      boundingBoxHeight = heightMultipleForVerticalDirection * ReactflowDimensionsConstantEstimator.getDefaultHeight();
      boundingBoxVisualNode = NodeClassic.createNewVisualNodeBasedOnSemanticData(null, "", null);
      boundingBoxVisualNodeComplete = new VisualNodeComplete(
        boundingBoxVisualNode, boundingBoxWidth, boundingBoxHeight, false, false, false);
      boundingBoxVisualNodeComplete.coreVisualNode.position.x = rootNode.completeVisualNode.coreVisualNode.position.x - boundingBoxWidth / 2;
      boundingBoxVisualNodeComplete.coreVisualNode.position.y = rootNode.completeVisualNode.coreVisualNode.position.y +
                                                                rootNode.completeVisualNode.height;
      boundingBoxes[Direction.Down] = boundingBoxVisualNodeComplete;

      for(const edge of graph.allEdges) {
        if((edgesToConsider === ToConsiderFilter.OnlyLayouted && !edge.isConsideredInLayout) ||
           (edgesToConsider === ToConsiderFilter.OnlyNotLayouted && edge.isConsideredInLayout)) {
          continue;
        }
        Object.entries(boundingBoxes).forEach(([direction, boundingBox]) => {
          populations[direction] += EdgeNodeCrossingMetric.isLineRectangleCollision(edge, boundingBox);
        })
      }

      return populations;
    }

    /**
     * Finds how many nodes are above, below, to the left and to the right of given {@link rootNode}.
     */
    static findSectorNodePopulation(
      graph: IMainGraphClassic,
      rootNode: EdgeEndPoint,
      nodesToConsider: ToConsiderFilter,
    ): Record<Direction, number> {
      const populations: Record<Direction, number> = {
        [Direction.Up]: 0,
        [Direction.Right]: 0,
        [Direction.Down]: 0,
        [Direction.Left]: 0
      };

      // TODO RadStr: Actually good, but I could play with the bounding box sizes, but more importantly
      // I should ideally make it proportional to the distance of the root cluster
      const verticalBoundingBoxWidth = 8 * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      const verticalBoundingBoxHeight = 6 * ReactflowDimensionsConstantEstimator.getDefaultHeight();
      const horizontalBoundingBoxWidth = 3 * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      const horizontalBoundingBoxHeight = 20 * ReactflowDimensionsConstantEstimator.getDefaultHeight();

      const rootNodePosition = rootNode.completeVisualNode.coreVisualNode.position;
      for(const node of graph.allNodes) {
        if(node.id === rootNode.id) {
          continue;
        }
        if((nodesToConsider === ToConsiderFilter.OnlyLayouted && !node.isConsideredInLayout) ||
           (nodesToConsider === ToConsiderFilter.OnlyNotLayouted && node.isConsideredInLayout)) {
          continue;
        }
        const iteratedNodePosition = node.completeVisualNode.coreVisualNode.position;

        if(iteratedNodePosition.x > rootNodePosition.x && iteratedNodePosition.x < rootNodePosition.x + horizontalBoundingBoxWidth &&
          iteratedNodePosition.y > rootNodePosition.y - horizontalBoundingBoxHeight / 2 &&
          iteratedNodePosition.y < rootNodePosition.y + horizontalBoundingBoxHeight / 2) {
          populations[Direction.Right]++;
        }
        else if(iteratedNodePosition.x < rootNodePosition.x && iteratedNodePosition.x > rootNodePosition.x - horizontalBoundingBoxWidth &&
          iteratedNodePosition.y > rootNodePosition.y - horizontalBoundingBoxHeight / 2 &&
          iteratedNodePosition.y < rootNodePosition.y + horizontalBoundingBoxHeight / 2) {
          populations[Direction.Left]++;
        }

        if(iteratedNodePosition.y > rootNodePosition.y && iteratedNodePosition.y < rootNodePosition.y + verticalBoundingBoxHeight &&
          iteratedNodePosition.x > rootNodePosition.x - verticalBoundingBoxWidth / 2 &&
          iteratedNodePosition.x < rootNodePosition.x + verticalBoundingBoxWidth / 2) {
          populations[Direction.Down]++;
        }
        else if(iteratedNodePosition.y < rootNodePosition.y && iteratedNodePosition.y > rootNodePosition.y - verticalBoundingBoxHeight &&
          iteratedNodePosition.x > rootNodePosition.x - verticalBoundingBoxWidth / 2 &&
          iteratedNodePosition.x < rootNodePosition.x + verticalBoundingBoxWidth / 2) {
          populations[Direction.Up]++;
        }
      }

      return populations;
    }
    // TODO RadStr: ...... Trying stuff - END
    // TODO RadStr: ...... Trying stuff - END

    /**
     * This method modifies input graph.
     * Either uses the given {@link rootNodeIdentifier} as root of tree (the node from which starts BFS search) or finds one through heuristic.
     * The result of this method is the change of input graph in such a way that the input graph becomes a tree (respectively DAG).
     * The method sets the isConsideredInLayout and reverseInLayout properties on edges and may add some dummy edges (for example to connect components)
     */
    static treeify(graph: IGraphClassic, rootNodeIdentifier?: string, edgeType?: "TODO" | "GENERALIZATION"): void {
      // TODO: Maybe only work with the subgraph or maybe only on the main graph, for example graph.resetForNewLayout, I am not sure if it works on subgraph
      let rootNode: INodeClassic;
      if(rootNodeIdentifier === undefined) {
          rootNode = GraphAlgorithms.findRootNode(graph, "MOST_EDGES");
      }
      else {
          // Empty for now
      }

      const visitedNodes: Record<string, true> = {};
      const usedEdges: Record<string, true> = {};

      let nodeToBFSLevelMap = GraphAlgorithms.treeifyBFSFromRoot(graph, visitedNodes, usedEdges, rootNode.id);
      const maxLevelInOriginalTree = Math.max(...Object.values(nodeToBFSLevelMap));
      Object.entries(graph.nodes).forEach(([nodeIdentifier, node]) => {
          if(visitedNodes[nodeIdentifier] === undefined) {
              // Have to Add edge because the radial algorithm can not work with graph with multiple components
              // TODO: Alternative solution is to layout each subgraph with radial algorithm, but it is a bit more work to implement
              const leaf = graph.nodes[Object.entries(nodeToBFSLevelMap).find(([_, level]) => level === maxLevelInOriginalTree)[0]];

              const addedEdge = EdgeClassic.addNewEdgeToGraph(
                  graph, null, null, null, leaf.id, node.id, null, "outgoingRelationshipEdges");


              // addedEdge.isConsideredInLayout = true;
              usedEdges[addedEdge.id] = true;
              const nextNodeToBFSLevelMap = GraphAlgorithms.treeifyBFSFromRoot(graph, visitedNodes, usedEdges, nodeIdentifier);
              Object.keys(nextNodeToBFSLevelMap).forEach(id => {
                nextNodeToBFSLevelMap[id] += maxLevelInOriginalTree;
              });


              nodeToBFSLevelMap = {
                ...nodeToBFSLevelMap,
                ...nextNodeToBFSLevelMap
              };
          }
      });



      for (const edge of graph.mainGraph.allEdges) {
        // Otherwise the edges within subgraphs aren't in the final layout, which doesn't actually affect the node positions, but we are missing the edges then
        // TODO: Or maybe we don't, we can set them from the previous run to the graph and we don't override them in the second run since they are not there ... so maybe unnecessary check
        const isInSubgraphEdge = graph.nodes[edge.start.id] === undefined || graph.nodes[edge.end.id] === undefined;
        if(Object.keys(usedEdges).find(usedEdge => usedEdge === edge.id) === undefined && !isInSubgraphEdge) {
          edge.isConsideredInLayout = false;
        }
        else {
          edge.isConsideredInLayout = true;
        }
      }


      // TODO: This would be better, but for some reason the radial algorithm doesn't work for larger graphs if we use max DAG (it takes too long and it is really interesting
      //       because on the DCAT-AP it works for the one large component but then we just connect 1 new node to the leaf and we are already in huge recursive call which doesn't stop)
      // GraphAlgorithms.addEdgesBackToGraphAndKeepItDAG(graph, usedEdges, nodeToBFSLevelMap);
  }

  /**
   * Sets the properties of edges - isConsideredInLayout and reverseInLayout - in such a way that the resulting graph is still DAG.
   */
  private static addEdgesBackToGraphAndKeepItDAG(graph: IGraphClassic, nodeToBFSLevelMap: Record<string, number>): void {
    Object.entries(nodeToBFSLevelMap).forEach(([nodeIdentifier, level]) => {
      for(const edge of graph.nodes[nodeIdentifier].getAllOutgoingEdges()) {
        const edgeEndLevel = nodeToBFSLevelMap[edge.end.id];
        if(edge.end.id === nodeIdentifier) {
          edge.isConsideredInLayout = false;
        }
        else if(edgeEndLevel >= level) {
          edge.isConsideredInLayout = true;
          edge.reverseInLayout = false;
        }
        else {
          edge.isConsideredInLayout = true;
          edge.reverseInLayout = true;
        }
      }
    });
  }

  static treeifyBFSFromRoot(graph: IGraphClassic, visitedNodes: Record<string, true>, usedEdges: Record<string, true>, rootNodeIdentifier: string): Record<string, number> {
    return GraphAlgorithms.treeifyBFS(graph, visitedNodes, usedEdges, [[rootNodeIdentifier, 0]]);
  }

  private static treeifyBFS(graph: IGraphClassic, visitedNodes: Record<string, true>, usedEdges: Record<string, true>, nodesInQueue: [string, number][]): Record<string, number> {
    const nodeToBFSLevelMap: Record<string, number> = {};

    while(nodesInQueue.length > 0) {
      const [nodeIdentifier, currentLevel]: [string, number] = nodesInQueue.shift();
      const node: INodeClassic = graph.nodes[nodeIdentifier];

      if(visitedNodes[node.id] === true) {
        continue;
      }

      visitedNodes[node.id] = true;
      nodeToBFSLevelMap[node.id] = currentLevel;

      for(const edge of graph.nodes[node.id].getAllIncomingEdges()) {
        if(visitedNodes[edge.start.id] !== true && nodesInQueue.find(([nodeInQueueIdentifier, _]) => nodeInQueueIdentifier === edge.start.id) === undefined && graph.nodes[edge.start.id] !== undefined) {
          usedEdges[edge.id] = true;
          nodesInQueue.push([edge.start.id, currentLevel + 1]);
          edge.reverseInLayout = true;
        }
      }
      for(const edge of graph.nodes[node.id].getAllOutgoingEdges()) {
        if(visitedNodes[edge.end.id] !== true && nodesInQueue.find(([nodeInQueueIdentifier, _]) => nodeInQueueIdentifier === edge.end.id) === undefined && graph.nodes[edge.end.id] !== undefined) {
          usedEdges[edge.id] = true;
          nodesInQueue.push([edge.end.id, currentLevel + 1]);
          edge.reverseInLayout = false;
        }
      }
    }

    return nodeToBFSLevelMap;
  }

  /**
   * Tries to find root node of tree based on given heuristic.
   * @returns the root node
   */
  static findRootNode(graph: IGraphClassic, heuristic: RootHeuristicType): INodeClassic {
      switch(heuristic) {
          case "MOST_EDGES":
              return GraphAlgorithms.findRootWithMostEdges(graph);
      };
  }
  static findRootWithMostEdges(graph: IGraphClassic): INodeClassic {
      let root: INodeClassic;
      let mostRelationships: number = 0;
      Object.entries(graph.nodes).forEach(([nodeIdentifier, node]) => {
          const relationshipCountForNode = [...node.getAllOutgoingEdges()].length + [...node.getAllIncomingEdges()].length;

          if(relationshipCountForNode > mostRelationships) {
              mostRelationships = relationshipCountForNode;
              root = node;
          }
      });

      return root;
  }


  static getSubgraphUsingBFS(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION", depth: number): GraphClassic {
      throw new Error("Unimplemented");
  }
  static findCliques(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION", size: number): GraphClassic {      // TODO:
      throw new Error("Unimplemented");
  }
}

class VisualAlgorithms {
    findClusters(graph: GraphClassic): string[][] {
        throw new Error("Unimplemented");
    }
    // TODO: Well this is calling layered algorithm with parameters which perform this effect
    layerify(graph: GraphClassic): void {
        throw new Error("Unimplemented");
    }
    // TODO: well this is basically calling https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-sporeCompaction.html
    compactify(graph: GraphClassic): void {
        throw new Error("Unimplemented");
    }
    // TODO: The idea was to do something like layerify but manually, based on node proximities, etc.
    prettify(graph: GraphClassic): void {
        throw new Error("Unimplemented");
    }
    computeAspectRatio(graph: GraphClassic): number {
        throw new Error("Unimplemented");
    }
    computeTotalGraphSize(graph: GraphClassic): Dimensions {
        throw new Error("Unimplemented");
    }
    computeTotalGraphArea(graph: GraphClassic): number {
        throw new Error("Unimplemented");
    }
    computeActuallyUsedGraphArea(graph: GraphClassic): number {
        throw new Error("Unimplemented");
    }
}
