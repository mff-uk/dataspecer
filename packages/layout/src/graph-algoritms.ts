import { GraphClassic, IEdgeClassic, IGraphClassic, INodeClassic } from "./graph-iface";

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
              const addedEdge = leaf.addEdgeTODO(null, null, node.id, true, "relationshipEdges");

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
        if(Object.keys(usedEdges).find(usedEdge => usedEdge === edge.id) === undefined) {
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

  private static addEdgesBackToGraphAndKeepItDAG(graph: IGraphClassic, usedEdges: Record<string, true>, nodeToBFSLevelMap: Record<string, number>): void {
    let todoCount = 0;
    let todoCountLoops = 0;

    Object.entries(nodeToBFSLevelMap).forEach(([nodeIdentifier, level]) => {
      for(const edge of graph.nodes[nodeIdentifier].getAllOutgoingEdges()) {
        const edgeEndLevel = nodeToBFSLevelMap[edge.end.id];
        if(edge.end.id === nodeIdentifier) {
          edge.isConsideredInLayout = false;
        }
        else if(edgeEndLevel >= level) {
          edge.isConsideredInLayout = true;
          edge.reverseInLayout = false;
          todoCount++;
        }
        else {
          edge.isConsideredInLayout = true;
          edge.reverseInLayout = true;
          todoCount++;
        }
      }
    });

    console.warn("todoCount");
    console.warn(todoCount);
    console.warn("todoCountLoops");
    console.warn(todoCountLoops);
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
        if(visitedNodes[edge.start.id] !== true && nodesInQueue.find(([nodeInQueueIdentifier, _]) => nodeInQueueIdentifier === edge.start.id) === undefined) {
          usedEdges[edge.id] = true;
          nodesInQueue.push([edge.start.id, currentLevel + 1]);
          edge.reverseInLayout = true;
        }
      }
      for(const edge of graph.nodes[node.id].getAllOutgoingEdges()) {
        if(visitedNodes[edge.end.id] !== true && nodesInQueue.find(([nodeInQueueIdentifier, _]) => nodeInQueueIdentifier === edge.end.id) === undefined) {
          usedEdges[edge.id] = true;
          nodesInQueue.push([edge.end.id, currentLevel + 1]);
          edge.reverseInLayout = false;
        }
      }
    }

    return nodeToBFSLevelMap;
  }

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
    layerify(graph: GraphClassic): void {
        throw new Error("Unimplemented");
    }
    compactify(graph: GraphClassic): void {
        throw new Error("Unimplemented");
    }
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
