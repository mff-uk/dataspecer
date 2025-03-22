import { Direction, ReactflowDimensionsConstantEstimator } from ".";
import {
  DefaultGraph,
  Graph,
  MainGraph,
} from "./graph/representation/graph";
import { EdgeNodeCrossingMetric } from "./graph/graph-metrics/implemented-metrics/edge-node-crossing";
import { addToRecordArray } from "./util/utils";
import { Node, DefaultNode, VisualNodeComplete } from "./graph/representation/node";
import { DefaultEdge, EdgeEndPoint, Edge } from "./graph/representation/edge";

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
    static dfs(graph: DefaultGraph, root: string, edgeType: "TODO" | "GENERALIZATION"): string[] {
        throw new Error("Unimplemented");
    }
    static bfs(graph: DefaultGraph, root: string, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    static findStrongComponents(graph: DefaultGraph, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    static findWeakComponents(graph: DefaultGraph, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    static computeJacardSimilarity(graph: DefaultGraph, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    static findLeaves(graph: DefaultGraph, edgeType: "TODO" | "GENERALIZATION"): string[] {
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
      graph: MainGraph
    ): void {
      const leafs: Record<string, Edge[]> = {};
      const clusters: Record<string, Edge[]> = {};
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
      graph: MainGraph
    ): void {
      const leafs: Record<string, Edge[]> = {};
      const clusters: Record<string, Edge[]> = {};
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
      graph: MainGraph
    ): void {
      const leafs: Record<string, Edge[]> = {};
      const clusters: Record<string, Edge[]> = {};
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


    /**
     * Returns biggest clusters for graph. Biggest in the number of nodes, not edges.
     */
    static clusterify(graph: MainGraph, clusterCount: number | null): Record<string, Edge[]> {
      const leafs: Record<string, Edge[]> = {};
      const clusters: Record<string, Edge[]> = {};
      const uniqueClusters: Record<string, Edge[]> = {};    // Clusters without multi-edges - we just take 1 representative
      graph.allNodes.forEach(node => {
        const edges = [...node.getAllEdges()];
        let secondEnd: string | null = null;
        let isSameEndForAllEdges = true;
        for(const edge of node.getAllOutgoingUniqueEdges()) {
          if(secondEnd === null) {
            secondEnd = edge.end.id;
          }
          if(secondEnd !== edge.end.id) {
            isSameEndForAllEdges = false;
            break;
          }
        }
        if(isSameEndForAllEdges) {
          for(const edge of node.getAllIncomingUniqueEdges()) {
            if(secondEnd === null) {
              secondEnd = edge.start.id;
            }
            if(secondEnd !== edge.start.id) {
              isSameEndForAllEdges = false;
              break;
            }
          }

          if(isSameEndForAllEdges && secondEnd !== null) {
            let isFirst = true;
            for(const edge of edges) {
              if(edge.start.id === edge.end.id) {
                continue;
              }
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
      const biggestClusters = sortedClusters.splice(0, Math.min(sortedClusters.length, clusterCount ?? sortedClusters.length));
      const result: Record<string, Edge[]> = {};
      for(const [name, cluster] of biggestClusters) {
        result[name] = cluster;
      }

      console.info("Object.keys(result).length", Object.keys(result).length, result);
      console.info("Object.keys(result).length", clusters, uniqueClusters);
      return result;
    }

    /**
     * Returns biggest clusters for graph. Biggest in the number of nodes, not edges.
     */
    static clusterifyAdvanced(graph: MainGraph, clusterCount: number | null): Record<string, Edge[]> {
      const leafs: Record<string, Edge[]> = {};
      const clusters: Record<string, Edge[]> = {};
      const uniqueClusters: Record<string, Edge[]> = {};    // Clusters without multi-edges - we just take 1 representative
      graph.allNodes.forEach(node => {
        const edges = [...node.getAllEdges()];
        let secondEnd: string | null = null;
        let isSameEndForAllEdges = true;
        for(const edge of node.getAllOutgoingUniqueEdges()) {
          if(edge.start.id === edge.end.id) {
            continue;
          }
          if(secondEnd === null) {
            secondEnd = edge.end.id;
          }
          if(secondEnd !== edge.end.id) {
            isSameEndForAllEdges = false;
            break;
          }
        }
        if(isSameEndForAllEdges) {
          for(const edge of node.getAllIncomingUniqueEdges()) {
            if(secondEnd === null) {
              secondEnd = edge.start.id;
            }
            if(secondEnd !== edge.start.id) {
              isSameEndForAllEdges = false;
              break;
            }
          }

          if(isSameEndForAllEdges && secondEnd !== null) {
            let isFirst = true;
            for(const edge of edges) {
              if(edge.start.id === edge.end.id) {
                continue;
              }
              // This happens if and only if there is a single graph component in which there are exactly 2 nodes connected by edge(s)
              if(clusters[node.id] !== undefined) {
                break;
              }
              addToRecordArray(node.id, edge, leafs);
              // Since it is leaf, the cluster root lies on the other end
              const clusterRoot = edge.start.id === node.id ? edge.end : edge.start;
              addToRecordArray(clusterRoot.id, edge, clusters);
              if(isFirst) {
                isFirst = false;
                addToRecordArray(clusterRoot.id, edge, uniqueClusters);
              }
              // TODO RadStr: Commented code
              // edge.layoutOptions["stress_edge_len"] = "250";
            }
          }
        }
      });


      const sortedClusters = Object.entries(uniqueClusters)
        .sort(([, edgesA], [, edgesB]) => edgesB.length - edgesA.length);
      // TODO: I should give it the uniqueClusters not the sorted ones (because it has better type)
      // TODO: Looking up in graph again - not optimal, I should know the entities by now.
      const clusterRoots = Object.keys(uniqueClusters)
        .map(identifier => graph.findNodeInAllNodes(identifier))
        .filter(node => node !== null);
      const components = GraphAlgorithms.findComponents(graph, clusterRoots);
      console.info("Components", components);
      GraphAlgorithms.extendClustersWithLoops(graph, null, components, sortedClusters, 50);
      const biggestClusters = sortedClusters.splice(0, Math.min(sortedClusters.length, clusterCount ?? sortedClusters.length));
      const result: Record<string, Edge[]> = {};
      for(const [name, cluster] of biggestClusters) {
        result[name] = cluster;
      }

      console.info("Object.keys(result).length", Object.keys(result).length, result);
      console.info("Object.keys(result).length", clusters, uniqueClusters);
      return result;
    }

    static findComponents(graph: MainGraph, clusterRoots: EdgeEndPoint[]) {
      const components: Record<string, number[]> = {};
      let currentComponent = -1;
      for(const node of graph.allNodes) {
        // Clutser roots get the identifier from the nodes in component
        if(clusterRoots.includes(node)) {
          continue;
        }
        if(components[node.id] === undefined) {
          currentComponent++;
          components[node.id] = [currentComponent];
        }
        else {
          // Already processesed
          continue;
        }
        GraphAlgorithms.findRemainingNodesInComponent(components, currentComponent, clusterRoots, [node]);
      }

      return components;
    }

    static findRemainingNodesInComponent(
      components: Record<string, number[]>,
      currentComponent: number,
      clusterRoots: EdgeEndPoint[],
      nodesInStack: EdgeEndPoint[]
    ): void {
      while(nodesInStack.length > 0) {
        const node = nodesInStack.shift();
        nodesInStack.push(...this.findUnexploredNodesInEdges(components, currentComponent, clusterRoots, node.getAllOutgoingEdges()));
        nodesInStack.push(...this.findUnexploredNodesInEdges(components, currentComponent, clusterRoots, node.getAllIncomingEdges()));
      }
    }

    static findUnexploredNodesInEdges(
      components: Record<string, number[]>,
      currentComponent: number,
      clusterRoots: EdgeEndPoint[],
      edges: Edge[] | Generator<Edge>,
    ): EdgeEndPoint[] {
      const unexploredNodes: EdgeEndPoint[] = [];
      for(const edge of edges) {
        if(clusterRoots.includes(edge.start)) {
          addToRecordArray(edge.start.id, currentComponent, components);
        }
        else if(components[edge.start.id] === undefined) {
          unexploredNodes.push(edge.start);
          components[edge.start.id] = [currentComponent];
        }

        if(clusterRoots.includes(edge.end)) {
          addToRecordArray(edge.end.id, currentComponent, components);
        }
        else if(components[edge.end.id] === undefined) {
          unexploredNodes.push(edge.end);
          components[edge.end.id] = [currentComponent];
        }
      }

      return unexploredNodes;
    }

    static findTrees(
      graph: MainGraph,
      clusterRoot: EdgeEndPoint,
      clusters: EdgeEndPoint[],
      components: Record<string, number[]>
    ) {
      for(const node of graph.allNodes) {
        if(node.id === clusterRoot.id) {
          continue;
        }

      }
    }

    // TODO RadStr: Remove the loop node
    static extendClustersWithLoops(
      graph: MainGraph,
      rootNode: EdgeEndPoint,
      components: Record<string, number[]>,
      clusters: [string, Edge[]][],
      maxComponentDepth: number
    ): void {
      const clusterRootsIdentifiers = clusters.map(([clusterIdentifier, _edgesInCluster]) => clusterIdentifier);
      const componentsToClusterRootsMap: Record<number, string[]> = {};
      // Map the components to cluster roots (that is from which cluster roots they are reachable)
      for(const clusterIdentifier of clusterRootsIdentifiers) {
        for(const componentIdentifier of components[clusterIdentifier]) {
          addToRecordArray(componentIdentifier, clusterIdentifier, componentsToClusterRootsMap);
        }
      }
      // Remove duplicates
      for(const [key, value] of Object.entries(componentsToClusterRootsMap)) {
        componentsToClusterRootsMap[key] = [...new Set(value)];
      }

      // Find those components which are going from exactly one cluster root, those are our loop components.
      // These components can be found the following way: There is exactly one cluster root for the component
      const loopComponentToClusterRootMap: Record<number, string> = {};
      for(const [component, clusterRoots] of Object.entries(componentsToClusterRootsMap)) {
        if(clusterRoots.length === 1) {
          loopComponentToClusterRootMap[component] = clusterRoots[0];
        }
      }

      // Now find the nodes in the loop components
      const nodesInLoopComponents: Record<number, string[]> = {}
      for(const [nodeIdentifier, componentsIdentifiers] of Object.entries(components)) {
        if(!clusterRootsIdentifiers.includes(nodeIdentifier) && componentsIdentifiers.length === 1) {
          if(loopComponentToClusterRootMap[componentsIdentifiers[0]] !== undefined) {
            addToRecordArray(componentsIdentifiers[0], nodeIdentifier, nodesInLoopComponents);
          }
        }
      }


      console.info("LOOP COMPONENTS", {componentsToClusterRootsMap, nodesInLoopComponents, loopComponentToClusterRootsMap: loopComponentToClusterRootMap, components});
      for(const [loopComponent, nodesInLoopComponent] of Object.entries(nodesInLoopComponents)) {
        if(nodesInLoopComponent.length < 2) {    // Can not be a loop
          continue;
        }
        console.info("IN LOOP COMPONENT");
        const loopToAddToCluster = GraphAlgorithms.findAllEdgesInComponent(graph, nodesInLoopComponent, maxComponentDepth);
        const clusterRootForThisLoop = loopComponentToClusterRootMap[loopComponent];
        const clusterToExtendByLoop = clusters.find(([clusterIdentifier, edgesInCluster]) => clusterRootForThisLoop === clusterIdentifier);
        if(clusterToExtendByLoop === undefined) {
          console.error("Can not find cluster even though it should be there, probably programmer error");
          continue;
        }
        clusterToExtendByLoop[1].push(...Object.values(loopToAddToCluster));

        const clusterRoot = graph.findNodeInAllNodes(clusterRootForThisLoop);
        for(const edge of clusterRoot.getAllIncomingEdges()) {
          if(nodesInLoopComponents[loopComponent].includes(edge.start.id)) {
            clusterToExtendByLoop[1].push(edge);
          }
        }
        for(const edge of clusterRoot.getAllOutgoingEdges()) {
          if(nodesInLoopComponents[loopComponent].includes(edge.end.id)) {
            clusterToExtendByLoop[1].push(edge);
          }
        }
      }

    }

    /**
     * Finds all edges in component using bfs or returns null if the component has depth larger than given {@link maxLoopDepth}.
     */
    static findAllEdgesInComponent(
      graph: MainGraph,
      nodesInGraph: string[],
      maxLoopDepth: number
    ) {
      const nodesInComponent = nodesInGraph
        .map(identifier => graph.findNodeInAllNodes(identifier))
        .filter(node => node !== null);
      if(nodesInComponent.length === 0) {
        console.error("For some unknow reason component is empty");
        return null;
      }
      const alreadyVisitedNodes: Record<string, true> = {};
      const alreadyVisitedEdges: Record<string, Edge> = {};
      let newlyFoundNodesInComponent = [nodesInComponent[0]];
      for(let i = 0; i < maxLoopDepth; i++) {
        newlyFoundNodesInComponent = GraphAlgorithms.findAllEdgesInComponentInternalOneStep(
          nodesInComponent, alreadyVisitedNodes, alreadyVisitedEdges, newlyFoundNodesInComponent);
        if(Object.keys(alreadyVisitedNodes).length === nodesInComponent.length) {
          break;
        }
      }

      if(Object.keys(alreadyVisitedNodes).length === nodesInComponent.length) {
        return alreadyVisitedEdges;
      }
      return null;
    }

    /**
     * Performs one bfs step of finding the edges
     */
    static findAllEdgesInComponentInternalOneStep(
      nodesInComponent: EdgeEndPoint[],
      alreadyVisitedNodes: Record<string, true>,
      alreadyVisitedEdgesInSubgraph: Record<string, Edge>,
      nodesToProcess: EdgeEndPoint[],
    ) {
      const newlyVisitedNodes: Set<EdgeEndPoint> = new Set();
      const edgesToProcess: Edge[] = [];
      for(const node of nodesToProcess) {
        if(alreadyVisitedNodes[node.id] === undefined) {
          alreadyVisitedNodes[node.id] = true;
          edgesToProcess.push(...node.getAllEdges());
        }
      }

      for(const edge of edgesToProcess) {
        if(!nodesInComponent.includes(edge.start) || !nodesInComponent.includes(edge.end)) {
          continue;
        }

        if(alreadyVisitedEdgesInSubgraph[edge.id] === undefined) {
          alreadyVisitedEdgesInSubgraph[edge.id] = edge;
          if(alreadyVisitedNodes[edge.start.id] === undefined) {
            newlyVisitedNodes.add(edge.start);
          }
          else if(alreadyVisitedNodes[edge.end.id] === undefined) {
            newlyVisitedNodes.add(edge.end);
          }
        }
      }

      return [...newlyVisitedNodes];
    }

    static pointAllEdgesFromRoot(
      root: string,
      edges: Edge[],
    ) {
      const lightweightGraph: Record<string, {
        edge: Edge,
        targetNode: string
      }[]> = {};
      for (const edge of edges) {
        addToRecordArray(edge.start.id, {edge, targetNode: edge.end.id}, lightweightGraph);
        // Reverse the edge, so BFS can find it
        addToRecordArray(edge.end.id, {edge, targetNode: edge.start.id}, lightweightGraph);
      }

      // BFS traversal from root
      const queue: string[] = [root];
      const visited: Set<string> = new Set([root]);

      while (queue.length > 0) {
        const node = queue.shift();
        for (const { edge, targetNode } of lightweightGraph[node]) {
          if (!visited.has(targetNode)) {
            queue.push(targetNode);
            visited.add(targetNode);
            if(edge.end.id !== targetNode) {
              edge.reverseInLayout = true;
            }
            else {
              edge.reverseInLayout = false;
            }
          }
        }
      }
    }



    // TODO: We could also put how many nodes collide into the computation
    /**
     * Finds how many edges collide with the bounding box, which is placed - above, below, to the left and to the right of given {@link rootNode}.
     */
    static findSectorEdgePopulation(
      graph: MainGraph,
      rootNode: EdgeEndPoint,
      edgesInCluster: Edge[],
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

      const clusterSize = edgesInCluster.length;
      const widthMultipleForHorizontalDirection = 3;
      const heightMultipleForHorizontalDirection = 3 * clusterSize;
      const widthMultipleForVerticalDirection = 2 * clusterSize;
      const heightMultipleForVerticalDirection = 6;


      let boundingBoxWidth = widthMultipleForHorizontalDirection * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      let boundingBoxHeight = heightMultipleForHorizontalDirection * ReactflowDimensionsConstantEstimator.getDefaultHeight();

      let boundingBoxVisualNode = DefaultNode.createNewVisualNodeBasedOnSemanticData(null, "", null);
      let boundingBoxVisualNodeComplete = new VisualNodeComplete(
        boundingBoxVisualNode, boundingBoxWidth, boundingBoxHeight, false, false, false);
      boundingBoxVisualNodeComplete.coreVisualNode.position.x = rootNode.completeVisualNode.coreVisualNode.position.x - boundingBoxWidth;
      boundingBoxVisualNodeComplete.coreVisualNode.position.y = rootNode.completeVisualNode.coreVisualNode.position.y - boundingBoxHeight / 2;
      boundingBoxes[Direction.Left] = boundingBoxVisualNodeComplete;

      boundingBoxVisualNode = DefaultNode.createNewVisualNodeBasedOnSemanticData(null, "", null);
      boundingBoxVisualNodeComplete = new VisualNodeComplete(
        boundingBoxVisualNode, boundingBoxWidth, boundingBoxHeight, false, false, false);
      boundingBoxVisualNodeComplete.coreVisualNode.position.x = rootNode.completeVisualNode.coreVisualNode.position.x +
                                                                rootNode.completeVisualNode.width;
      boundingBoxVisualNodeComplete.coreVisualNode.position.y = rootNode.completeVisualNode.coreVisualNode.position.y - boundingBoxHeight / 2;
      boundingBoxes[Direction.Right] = boundingBoxVisualNodeComplete;


      boundingBoxWidth = widthMultipleForVerticalDirection * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      boundingBoxHeight = heightMultipleForVerticalDirection * ReactflowDimensionsConstantEstimator.getDefaultHeight();
      boundingBoxVisualNode = DefaultNode.createNewVisualNodeBasedOnSemanticData(null, "", null);
      boundingBoxVisualNodeComplete = new VisualNodeComplete(
        boundingBoxVisualNode, boundingBoxWidth, boundingBoxHeight, false, false, false);
      boundingBoxVisualNodeComplete.coreVisualNode.position.x = rootNode.completeVisualNode.coreVisualNode.position.x - boundingBoxWidth / 2;
      boundingBoxVisualNodeComplete.coreVisualNode.position.y = rootNode.completeVisualNode.coreVisualNode.position.y - boundingBoxHeight;
      boundingBoxes[Direction.Up] = boundingBoxVisualNodeComplete;

      boundingBoxWidth = widthMultipleForVerticalDirection * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      boundingBoxHeight = heightMultipleForVerticalDirection * ReactflowDimensionsConstantEstimator.getDefaultHeight();
      boundingBoxVisualNode = DefaultNode.createNewVisualNodeBasedOnSemanticData(null, "", null);
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
      graph: MainGraph,
      rootNode: EdgeEndPoint,
      edgesInCluster: Edge[],
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
      // TODO: Old without proportional
      // const verticalBoundingBoxWidth = 8 * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      // const verticalBoundingBoxHeight = 6 * ReactflowDimensionsConstantEstimator.getDefaultHeight();
      // const horizontalBoundingBoxWidth = 3 * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      // const horizontalBoundingBoxHeight = 20 * ReactflowDimensionsConstantEstimator.getDefaultHeight();
      const clusterSize = edgesInCluster.length;
      const verticalBoundingBoxWidth = 2 * clusterSize * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      const verticalBoundingBoxHeight = 6 * ReactflowDimensionsConstantEstimator.getDefaultHeight();
      const horizontalBoundingBoxWidth = 3 * ReactflowDimensionsConstantEstimator.getDefaultWidth();
      const horizontalBoundingBoxHeight = 3 * clusterSize * ReactflowDimensionsConstantEstimator.getDefaultHeight();

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
    static treeify(graph: Graph, rootNodeIdentifier?: string, edgeType?: "TODO" | "GENERALIZATION"): void {
      // TODO: Maybe only work with the subgraph or maybe only on the main graph, for example graph.resetForNewLayout, I am not sure if it works on subgraph
      let rootNode: Node;
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

              const addedEdge = DefaultEdge.addNewEdgeToGraph(
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
  private static addEdgesBackToGraphAndKeepItDAG(graph: Graph, nodeToBFSLevelMap: Record<string, number>): void {
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

  static treeifyBFSFromRoot(graph: Graph, visitedNodes: Record<string, true>, usedEdges: Record<string, true>, rootNodeIdentifier: string): Record<string, number> {
    return GraphAlgorithms.treeifyBFS(graph, visitedNodes, usedEdges, [[rootNodeIdentifier, 0]]);
  }

  private static treeifyBFS(graph: Graph, visitedNodes: Record<string, true>, usedEdges: Record<string, true>, nodesInQueue: [string, number][]): Record<string, number> {
    const nodeToBFSLevelMap: Record<string, number> = {};

    while(nodesInQueue.length > 0) {
      const [nodeIdentifier, currentLevel]: [string, number] = nodesInQueue.shift();
      const node: Node = graph.nodes[nodeIdentifier];

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
  static findRootNode(graph: Graph, heuristic: RootHeuristicType): Node {
      switch(heuristic) {
          case "MOST_EDGES":
              return GraphAlgorithms.findRootWithMostEdges(graph);
      };
  }
  static findRootWithMostEdges(graph: Graph): Node {
      let root: Node;
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


  static getSubgraphUsingBFS(graph: DefaultGraph, edgeType: "TODO" | "GENERALIZATION", depth: number): DefaultGraph {
      throw new Error("Unimplemented");
  }
  static findCliques(graph: DefaultGraph, edgeType: "TODO" | "GENERALIZATION", size: number): DefaultGraph {      // TODO:
      throw new Error("Unimplemented");
  }
}

class VisualAlgorithms {
    findClusters(graph: DefaultGraph): string[][] {
        throw new Error("Unimplemented");
    }
    // TODO: Well this is calling layered algorithm with parameters which perform this effect
    layerify(graph: DefaultGraph): void {
        throw new Error("Unimplemented");
    }
    // TODO: well this is basically calling https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-sporeCompaction.html
    compactify(graph: DefaultGraph): void {
        throw new Error("Unimplemented");
    }
    // TODO: The idea was to do something like layerify but manually, based on node proximities, etc.
    prettify(graph: DefaultGraph): void {
        throw new Error("Unimplemented");
    }
    computeAspectRatio(graph: DefaultGraph): number {
        throw new Error("Unimplemented");
    }
    computeTotalGraphSize(graph: DefaultGraph): Dimensions {
        throw new Error("Unimplemented");
    }
    computeTotalGraphArea(graph: DefaultGraph): number {
        throw new Error("Unimplemented");
    }
    computeActuallyUsedGraphArea(graph: DefaultGraph): number {
        throw new Error("Unimplemented");
    }
}
