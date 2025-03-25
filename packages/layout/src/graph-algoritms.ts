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

type DataAboutLeafGraphComponents = {
  leafComponents: LeafGraphComponent[],
  /**
   * Those are components which belong to exacly one cluster root
   */
  leafComponentToClusterRootMap: Record<number, string>,
  componentsToClusterRootsMap: Record<number, string[]>
}

type LeafGraphComponent = {
  clusterRoot: EdgeEndPoint,
  nodesInComponent: string[],
  clusterToExtend: [string, Edge[]],
} & EdgesInLeafComponent;

type EdgesInLeafComponent = {
  edges: Record<string, Edge>,
  isTree: boolean,
  maxBranchingFactor: number,
}

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


      const sortedClusters = Object.entries(clusters)
        .sort(([, edgesA], [, edgesB]) => edgesB.length - edgesA.length);
      // TODO: I should give it the uniqueClusters not the sorted ones (because it has better type)
      // TODO: Looking up in graph again - not optimal, I should know the entities by now.
      const clusterRoots = Object.keys(clusters)
        .map(identifier => graph.findNodeInAllNodes(identifier))
        .filter(node => node !== null);
      const components = GraphAlgorithms.findComponents(graph, clusterRoots);
      const clusterRootsToComponentsMap: Record<string, number[]> = {};
      for(const [node, componentsForNode] of Object.entries(components)) {
        if(clusterRoots.findIndex(clusterRoot => clusterRoot.id === node) >= 0) {
          clusterRootsToComponentsMap[node] = componentsForNode;
        }
      }
      console.info("Components", components);
      const graphComponentsToExtendClustersWith = GraphAlgorithms.findComponentsToExtendClustersWith(graph, clusterRootsToComponentsMap, sortedClusters, 3);
      GraphAlgorithms.extendClustersWithLoops(graphComponentsToExtendClustersWith.leafComponents);
      const biggestClusters = sortedClusters.splice(0, Math.min(sortedClusters.length, clusterCount ?? sortedClusters.length));
      GraphAlgorithms.mergeGraphComponents(graph, graphComponentsToExtendClustersWith, components, clusterRoots, biggestClusters);
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
        nodesInStack.push(...this.findUnexploredNodesInEdges(components, currentComponent, clusterRoots, node.getAllOutgoingUniqueEdges()));
        nodesInStack.push(...this.findUnexploredNodesInEdges(components, currentComponent, clusterRoots, node.getAllIncomingUniqueEdges()));
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

    static findComponentsToExtendClustersWith(
      graph: MainGraph,
      clusterRootsToComponentsMap: Record<string, number[]>,
      clusters: [string, Edge[]][],
      maxComponentDepth: number
    ): DataAboutLeafGraphComponents {
      const clusterRootsIdentifiers = clusters.map(([clusterIdentifier, _edgesInCluster]) => clusterIdentifier);
      const componentsToClusterRootsMap: Record<number, string[]> = {};
      // Map the components to cluster roots (that is from which cluster roots they are reachable)
      for(const clusterIdentifier of clusterRootsIdentifiers) {
        for(const componentIdentifier of clusterRootsToComponentsMap[clusterIdentifier]) {
          addToRecordArray(componentIdentifier, clusterIdentifier, componentsToClusterRootsMap);
        }
      }
      // Remove duplicates
      for(const [key, value] of Object.entries(componentsToClusterRootsMap)) {
        componentsToClusterRootsMap[key] = [...new Set(value)];
      }

      // Find those components which are going from exactly one cluster root, those are our loop components.
      // These components can be found the following way: There is exactly one cluster root for the component
      const leafComponentToClusterRootMap: Record<number, string> = {};
      for(const [component, clusterRoots] of Object.entries(componentsToClusterRootsMap)) {
        if(clusterRoots.length === 1) {
          leafComponentToClusterRootMap[component] = clusterRoots[0];
        }
      }

      // Now find the nodes in the loop components
      const nodesInExtensionComponents: Record<number, string[]> = {}
      for(const [nodeIdentifier, componentsIdentifiers] of Object.entries(clusterRootsToComponentsMap)) {
        if(!clusterRootsIdentifiers.includes(nodeIdentifier) && componentsIdentifiers.length === 1) {
          if(leafComponentToClusterRootMap[componentsIdentifiers[0]] !== undefined) {
            addToRecordArray(componentsIdentifiers[0], nodeIdentifier, nodesInExtensionComponents);
          }
        }
      }


      const leafComponents: LeafGraphComponent[] = [];
      console.info("LOOP COMPONENTS", {componentsToClusterRootsMap, nodesInExtensionComponents, extensionComponentToClusterRootMap: leafComponentToClusterRootMap, components: clusterRootsToComponentsMap});
      for(const [extensionComponent, nodesInExtensionComponent] of Object.entries(nodesInExtensionComponents)) {
        // TODO: Actually no - we newly allow non-loops
        // if(nodesInExtensionComponent.length < 2) {    // Can not be a loop
        //   continue;
        // }
        console.info("IN LOOP COMPONENT");
        const componentToExtendClustersWith = GraphAlgorithms.findAllEdgesInComponent(graph, nodesInExtensionComponent, maxComponentDepth);
        const clusterRootForThisComponent = leafComponentToClusterRootMap[extensionComponent];
        const clusterRoot = graph.findNodeInAllNodes(clusterRootForThisComponent);
        const clusterToExtend = clusters.find(([clusterIdentifier, edgesInCluster]) => clusterRootForThisComponent === clusterIdentifier);
        if(clusterToExtend === undefined) {
          console.error("Can not find cluster even though it should be there, probably programmer error");
          continue;
        }

        leafComponents.push({
          ...componentToExtendClustersWith,
          clusterRoot,
          nodesInComponent: nodesInExtensionComponent,
          clusterToExtend,
        });
      }

      return {
        leafComponents,
        leafComponentToClusterRootMap,
        componentsToClusterRootsMap};
    }

    static extendClustersWithLoops(
      leafComponents: LeafGraphComponent[],
    ) {
      for(const graphComponent of leafComponents) {
        if(graphComponent.isTree) {
          continue;
        }

        const edgesGoingToComponentFromRoot = GraphAlgorithms.getEdgesGoingFromClusterRootToCandidates(
          graphComponent.clusterRoot, graphComponent.nodesInComponent);
        graphComponent.clusterToExtend[1].push(...edgesGoingToComponentFromRoot);
        // Extend by the edges inside the graph component
        graphComponent.clusterToExtend[1].push(...Object.values(graphComponent.edges));
      }
    }

    static getEdgesGoingFromClusterRootToCandidates(
      clusterRoot: EdgeEndPoint,
      possibleCandidatesForEnds: string[],
    ) {
      const resultEdges: Edge[] = [];
      // Extend by the edges going from the cluster root
      for(const edge of clusterRoot.getAllIncomingEdges()) {
        if(possibleCandidatesForEnds.includes(edge.start.id)) {
          resultEdges.push(edge);
        }
      }
      for(const edge of clusterRoot.getAllOutgoingEdges()) {
        if(possibleCandidatesForEnds.includes(edge.end.id)) {
          resultEdges.push(edge);
        }
      }

      return resultEdges;
    }

    static mergeGraphComponents(
      graph: MainGraph,
      leafComponentsData: DataAboutLeafGraphComponents,
      nodesToComponentsMap: Record<string, number[]>,
      allClusterRoots: EdgeEndPoint[],
      clusters: [string, Edge[]][]
    ) {
      console.info("concatGraphComponents", {clusters, allClusterRoots, nodesToComponentsMap, leafComponentsData});

      // Without the cluster roots
      const componentContents: Record<number, string[]> = {};
      for (const [node, components] of Object.entries(nodesToComponentsMap)) {
        if(components.length === 1) {
          addToRecordArray(components[0], node, componentContents);
        }
      }

      const componentsToBeMergedToParent: string[] = [];
      const mergeParents: string[] = [];
      // The map of cluster to all its underlying clusters (that is those which reach exactly one cluster root)
      const chains: Record<string, string[]> = {};
      const alreadyProcessedComponents: Record<number, true> = {};
      for(const leafComponent of Object.keys(leafComponentsData.leafComponentToClusterRootMap)) {
        const currentChain: [Node, number][] = [];
        const clusterRootForLeafIdentifier = leafComponentsData.leafComponentToClusterRootMap[leafComponent];
        const clusterRootForLeaf = allClusterRoots.find(root => root.id === clusterRootForLeafIdentifier);
        // TODO: DEBUG
        if(clusterRootForLeaf.semanticEntityRepresentingNode.iri === "http://spdx.org/rdf/terms#License") {
          console.info("Chain of length http://spdx.org/rdf/terms#License");
        }
        if(clusterRootForLeaf.semanticEntityRepresentingNode.iri === "http://spdx.org/rdf/terms#LicenseException") {
          console.info("Chain of length http://spdx.org/rdf/terms#LicenseException");
        }
        if(clusterRootForLeaf.semanticEntityRepresentingNode.iri === "http://spdx.org/rdf/terms#ExternalRef") {
          console.info("Chain of length http://spdx.org/rdf/terms#ExternalRef");
        }
        if(clusterRootForLeaf.semanticEntityRepresentingNode.iri === "http://spdx.org/rdf/terms#AnyLicenseInfo") {
          console.info("Chain of length http://spdx.org/rdf/terms#AnyLicenseInfo");
        }

        GraphAlgorithms.createChainOfComponents(
          currentChain, clusterRootForLeaf, Number(leafComponent), allClusterRoots,
          leafComponentsData.componentsToClusterRootsMap, nodesToComponentsMap,
          alreadyProcessedComponents, leafComponentsData.leafComponentToClusterRootMap);
        // TODO: DEBUG
        console.info("currentChain", currentChain.map(node => node[0].semanticEntityRepresentingNode.iri));

        let previousClusterRoot: Node | null = null;
        let previousClusterEdges: Edge[] = null;
        for(const [node, component] of currentChain) {
          const edgesConnectingPreviousClusterRootToThisComponent = [];
          if(previousClusterRoot !== null) {
            if(component === -1) {    // It is the last one directly and cluster roots are directly connected
              for(const edge of previousClusterRoot.getAllOutgoingEdges()) {
                if(node.id === edge.end.id) {
                  edgesConnectingPreviousClusterRootToThisComponent.push(edge);
                }
              }
              for(const edge of previousClusterRoot.getAllIncomingEdges()) {
                if(node.id === edge.start.id) {
                  edgesConnectingPreviousClusterRootToThisComponent.push(edge);
                }
              }
            }
            else {
              for(const edge of previousClusterRoot.getAllOutgoingEdges()) {
                if(componentContents[component].includes(edge.end.id)) {
                  edgesConnectingPreviousClusterRootToThisComponent.push(edge);
                }
              }
              for(const edge of previousClusterRoot.getAllIncomingEdges()) {
                if(componentContents[component].includes(edge.start.id)) {
                  edgesConnectingPreviousClusterRootToThisComponent.push(edge);
                }
              }
            }
          }
          // TODO: The depth
          // TODO: Return the branching factor also
          previousClusterRoot = node;
          console.info("clusters", {...clusters});
          console.info("clusters", node.id);
          const [_cluster, edgesInCluster] = clusters.find(([id, edgesInCluster]) => id === node.id);
          if(componentContents[component] !== undefined) {
            const edges = GraphAlgorithms.findAllEdgesInComponent(graph, componentContents[component], 30);
            console.info("clusters", {edges, edgesConnectingPreviousClusterRootToThisComponent}, componentContents);
            edgesInCluster.push(...Object.values(edges.edges));

            const edgesGoingToComponentFromRoot = GraphAlgorithms.getEdgesGoingFromClusterRootToCandidates(
              node, componentContents[component]);
            edgesInCluster.push(...edgesGoingToComponentFromRoot);
          }
          edgesInCluster.push(...edgesConnectingPreviousClusterRootToThisComponent);

          if(previousClusterEdges !== null) {
            edgesInCluster.push(...previousClusterEdges);
          }
          previousClusterEdges = edgesInCluster;
        }
        for(let i = 0; i < currentChain.length - 1; i++) {
          componentsToBeMergedToParent.push(currentChain[i][0].id);
        }
        mergeParents.push(currentChain.at(-1)[0].id);
      }

      for(const componentToMerge of [...new Set(componentsToBeMergedToParent)]) {
        console.info("Shrinking clusters", {componentToMerge, mergeParents});
        if(mergeParents.includes(componentToMerge)) {
          console.info("Trying to remove some merge parent");   // TODO: Remove the debug print ... just for now
          continue;
        }
        const index = clusters.findIndex(([id, _edges]) => id === componentToMerge);
        if(index === -1) {
          console.error("Shrinking non-existing cluster");
        }
        clusters.splice(index, 1);
      }

      for(const cluster of clusters) {
        cluster[1] = [...new Set(cluster[1])]
      }
      console.info("Resulting clusters", clusters, componentsToBeMergedToParent);
    }


/**
     *
     * @param chain Cluster roots together with the components
     */
    static createChainOfComponents(
      chain: [Node, number][],
      currentlyProcessedClusterRoot: Node,
      currentComponent: number,
      allClusterRoots: EdgeEndPoint[],
      componentsToClusterRootsMap: Record<number, string[]>,
      nodesToComponentsMap: Record<string, number[]>,
      alreadyProcessedComponents: Record<number, true>,
      leafComponentToClusterRootMap: Record<number, string>,
    ) {
      // TODO: I am not sure about when to chain - but probably remove, we should do it later (after the if check)
      // We want to push it in always
      // chain.push([currentlyProcessedClusterRoot, currentComponent]);
      if(alreadyProcessedComponents[currentComponent]) {
        return;
      }
      alreadyProcessedComponents[currentComponent] = true;

      const nextRootCandidatesWithComponent: [string, number][] = [];
      const componentsForCurrentClusterRoot = nodesToComponentsMap[currentlyProcessedClusterRoot.id];
      for(const componentForClusterRoot of componentsForCurrentClusterRoot) {
        const newClusterRoots = componentsToClusterRootsMap[componentForClusterRoot]
          .filter(root => root !== currentlyProcessedClusterRoot.id)
          .map(root => [root, componentForClusterRoot] as [string, number]);
        nextRootCandidatesWithComponent.push(...newClusterRoots);
      }

      const directlyConnectedClusterRoots = GraphAlgorithms.findDirectlyConnectedClusterRoots(
        currentlyProcessedClusterRoot, allClusterRoots)
        .map(root => [root, -1] as [string, number]);
      chain.push([currentlyProcessedClusterRoot, currentComponent]);
      console.info("clusterRootsForComponent.concat(directlyConnectedClusterRoots))", nextRootCandidatesWithComponent.concat(directlyConnectedClusterRoots).length, nextRootCandidatesWithComponent, directlyConnectedClusterRoots);
      const connectedClusterRoots = nextRootCandidatesWithComponent.concat(directlyConnectedClusterRoots);
      // if(leafComponentToClusterRootMap[currentComponent] !== undefined) {
      //   // If it is leaf component we we want to push it in even if we will be not extending the path
      //   // That is the connectedClusterRoots.length > 2 check succeeds
      //   chain.push([currentlyProcessedClusterRoot, currentComponent]);
      // }
      if(connectedClusterRoots.length !== 1) {
        console.info("RETURN");
        return;
      }
      // if(leafComponentToClusterRootMap[currentComponent] === undefined) {
      //   // If we are not leaf, then we will push into if and only if there is next chain
      //   chain.push([currentlyProcessedClusterRoot, currentComponent]);
      // }

      for(const [nextClusterRoot, nextComponent] of connectedClusterRoots) {
        if(nextClusterRoot === currentlyProcessedClusterRoot.id) {
          continue;
        }

        const nextClusterRootAsNode = allClusterRoots.find(root => root.id === nextClusterRoot);
        if(nodesToComponentsMap[nextClusterRoot].length === 2) {
          for(const componentForClusterRoot of nodesToComponentsMap[nextClusterRoot]) {
            if(componentForClusterRoot === currentComponent) {
              continue;
            }
            // We process the leaf components separately in the main loop
            // Otherwise we would have something like 2 sided "triangle" -
            // Think of this graph A-B-C-D-E, here B and D are cluster roots, but we don't want to connect them (unless we could somehow make the C
            // the root, but that is way too complicated)
            if(leafComponentToClusterRootMap[componentForClusterRoot] !== undefined) {
              continue;
            }

            GraphAlgorithms.createChainOfComponents(
              chain, nextClusterRootAsNode, componentForClusterRoot,
              allClusterRoots, componentsToClusterRootsMap, nodesToComponentsMap,
              alreadyProcessedComponents, leafComponentToClusterRootMap);
          }
        }
        else {
          // We just push it in but we end here, because it is no longer path of components
          chain.push([nextClusterRootAsNode, nextComponent]);
          return;
        }
      }
    }

    // /**
    //  *
    //  * @param chain Cluster roots together with the components
    //  */
    // static createChainOfComponents(
    //   chain: [Node, number][],
    //   currentlyProcessedClusterRoot: Node,
    //   currentComponent: number,
    //   allClusterRoots: EdgeEndPoint[],
    //   componentsToClusterRootsMap: Record<number, string[]>,
    //   nodesToComponentsMap: Record<string, number[]>,
    //   alreadyProcessedComponents: Record<number, true>,
    //   leafComponentToClusterRootMap: Record<number, string>
    // ) {
    //   if(alreadyProcessedComponents[currentComponent]) {
    //     return;
    //   }
    //   alreadyProcessedComponents[currentComponent] = true;
    //   chain.push([currentlyProcessedClusterRoot, currentComponent]);

    //   const clusterRootsForComponent = componentsToClusterRootsMap[currentComponent];

    //   const directlyConnectedClusterRoots = GraphAlgorithms.findDirectlyConnectedClusterRoots(
    //     currentlyProcessedClusterRoot, allClusterRoots);

    //   console.info("clusterRootsForComponent.concat(directlyConnectedClusterRoots))", clusterRootsForComponent.concat(directlyConnectedClusterRoots).length, clusterRootsForComponent, directlyConnectedClusterRoots);
    //   const connectedClusterRoots = clusterRootsForComponent.concat(directlyConnectedClusterRoots);
    //   // if(leafComponentToClusterRootMap[currentComponent] !== undefined) {
    //   //   // If it is leaf component we we want to push it in even if we will be not extending the path
    //   //   // That is the connectedClusterRoots.length > 2 check succeeds
    //   //   chain.push([currentlyProcessedClusterRoot, currentComponent]);
    //   // }
    //   if(connectedClusterRoots.length > 2) {
    //     console.info("RETURN");
    //     return;
    //   }
    //   // if(leafComponentToClusterRootMap[currentComponent] === undefined) {
    //   //   // If we are not leaf, then we will push into if and only if there is next chain
    //   //   // .... TODO: Well really?
    //   //   chain.push([currentlyProcessedClusterRoot, currentComponent]);
    //   // }

    //   for(const clusterRootForComponent of connectedClusterRoots) {
    //     if(clusterRootForComponent === currentlyProcessedClusterRoot.id) {
    //       continue;
    //     }

    //     const clusterRootAsNode = allClusterRoots.find(root => root.id === clusterRootForComponent);
    //     if(nodesToComponentsMap[clusterRootForComponent].length === 2) {
    //       for(const componentForClusterRoot of nodesToComponentsMap[clusterRootForComponent]) {
    //         if(componentForClusterRoot === currentComponent) {
    //           continue;
    //         }
    //         // We process the leaf components separately in the main loop
    //         // Otherwise we would have something like 2 sided "triangle" -
    //         // Think of this graph A-B-C-D-E, here B and D are cluster roots, but we don't want to connect them (unless we could somehow make the C
    //         // the root, but that is way too complicated)
    //         if(leafComponentToClusterRootMap[componentForClusterRoot] !== undefined) {
    //           return;
    //         }

    //         GraphAlgorithms.createChainOfComponents(
    //           chain, clusterRootAsNode, componentForClusterRoot,
    //           allClusterRoots, componentsToClusterRootsMap, nodesToComponentsMap,
    //           alreadyProcessedComponents, leafComponentToClusterRootMap);
    //       }
    //     }
    //     else {
    //       // We just push it in but we end here, because it is no longer path of components
    //       chain.push([clusterRootAsNode, -1]);
    //     }
    //   }
    // }

    static findDirectlyConnectedClusterRoots(sourceNode: Node, clusterRoots: EdgeEndPoint[]): string[] {
      const directlyConnectedClusterRoots: string[] = [];
      // TODO: 3 Debug prints
      console.info("findDirectlyConnectedClusterRoots", {sourceNode, clusterRoots});
      for(const edge of sourceNode.getAllOutgoingUniqueEdges()) {
        if(clusterRoots.includes(edge.end)) {
          console.info("INCLUDES", {clusterRoots, end: edge.end});
          directlyConnectedClusterRoots.push(edge.end.id);
        }
      }
      for(const edge of sourceNode.getAllIncomingUniqueEdges()) {
        if(clusterRoots.includes(edge.start)) {
          console.info("INCLUDES", {clusterRoots, start: edge.start});
          directlyConnectedClusterRoots.push(edge.start.id);
        }
      }

      return directlyConnectedClusterRoots;
    }

    /**
     * Finds all edges in component using bfs or returns null if the component has depth larger than given {@link maxLoopDepth}.
     */
    static findAllEdgesInComponent(
      graph: MainGraph,
      componentNodeContent: string[],
      maxLoopDepth: number
    ): EdgesInLeafComponent {
      const nodesInComponent = componentNodeContent
        .map(identifier => graph.findNodeInAllNodes(identifier))
        .filter(node => node !== null);
      if(nodesInComponent.length === 0) {
        console.error("For some unknow reason component is empty");
        return null;
      }
      const alreadyVisitedNodes: Record<string, true> = {};
      const alreadyVisitedEdges: Record<string, Edge> = {};
      let newlyFoundNodesInComponent = [nodesInComponent[0]];
      let maxBranchingFactor = -1;
      for(let i = 0; i < maxLoopDepth; i++) {
        const {
          newlyVisitedNodes,
          maxBranchingFactor: newMaxBranchingFactor
        } = GraphAlgorithms.findAllEdgesInComponentInternalOneStep(
          nodesInComponent, alreadyVisitedNodes, alreadyVisitedEdges, newlyFoundNodesInComponent,
          maxBranchingFactor);
          newlyFoundNodesInComponent = newlyVisitedNodes;
          maxBranchingFactor = newMaxBranchingFactor;
        if(Object.keys(alreadyVisitedNodes).length === nodesInComponent.length) {
          break;
        }
      }

      if(Object.keys(alreadyVisitedNodes).length === nodesInComponent.length) {
        let edgeCount = 0;
        for(const edge of Object.values(alreadyVisitedEdges)) {
          if(edge.start.id === edge.start.id) {
            // Skip loops
            continue;
          }
          edgeCount++;
        }
        return {
          edges: alreadyVisitedEdges,
          isTree: edgeCount === nodesInComponent.length - 1,
          maxBranchingFactor
        };
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
      maxBranchingFactor: number
    ) {
      const newlyVisitedNodes: Set<EdgeEndPoint> = new Set();
      const edgesToProcess: Edge[] = [];
      for(const node of nodesToProcess) {
        if(alreadyVisitedNodes[node.id] === undefined) {
          alreadyVisitedNodes[node.id] = true;
          edgesToProcess.push(...node.getAllEdges());

          maxBranchingFactor = Math.max([...node.getAllOutgoingUniqueEdges()].length, maxBranchingFactor);
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

      return {
        newlyVisitedNodes: [...newlyVisitedNodes],
        maxBranchingFactor
      };
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
      const visitedEdges: Set<string> = new Set();

      while (queue.length > 0) {
        const node = queue.shift();
        for (const { edge, targetNode } of lightweightGraph[node]) {
          if (!visited.has(targetNode)) {
            queue.push(targetNode);
            visited.add(targetNode);
          }
          if (!visitedEdges.has(edge.id)) {
            visitedEdges.add(edge.id);
            if(edge.end.id !== targetNode) {
              edge.reverseInLayout = true;
              console.info("REVERSING");
            }
            else {
              console.info("NOT REVERSING");
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

  // Taken from https://www.geeksforgeeks.org/articulation-points-or-cut-vertices-in-a-graph/
  // The code is pretty awful though
  static findArticulationPoints(graph: MainGraph): EdgeEndPoint[] {
    const vertices = graph.allNodes.length;
    const result = [];
    const disc: number[] = new Array(vertices).fill(0);
    const low: number[] = new Array(vertices).fill(0);
    // to keep track of visited vertices
    let visited = new Array(vertices).fill(0);
    // Marks articulation points
    const ap: boolean[] = new Array(vertices).fill(false);
    const adjList: Map<number, number[]> = new Map();
    // to store time and parent node
    let time = [0];
    let par = -1;
    for(let i = 0; i < vertices; i++) {
      adjList[i] = [];
    }
    for(const edge of graph.allEdges) {
      const start = graph.findNodeIndexInAllNodes(edge.start.id);
      const end = graph.findNodeIndexInAllNodes(edge.end.id);
      adjList[start].push(end);
      adjList[end].push(start);
    }

    // Adding this loop so that the code works
    // even if we are given disconnected graph
    for (let u = 0; u < vertices; u++)
      if (visited[u] === 0)
        GraphAlgorithms.findPoints(adjList, u, visited, disc, low, time, par, ap);

    // storing the articulation points
    for (let u = 0; u < vertices; u++)
        if (ap[u])
            result.push(u);

    const articulationPoints = result.map(index => graph.allNodes[index]);
    console.info("articulations", adjList, articulationPoints);


    if (articulationPoints.length === 0)
        return articulationPoints;

    return articulationPoints;
  }

  // helper function to perform dfs and find the articulation points
  static findPoints(adj, u, visited, disc, low, time, parent, isAP) {

    // Count of children in DFS Tree
    let children = 0;

    // Mark the current node as visited
    visited[u] = 1;

    // Initialize discovery time and low value
    time[0]++;
    disc[u] = time[0];
    low[u] = time[0];

    // Go through all vertices adjacent to this
    for (let v of adj[u]) {

        // If v is not visited yet, then make it a child of u
        // in DFS tree and recur for it
        if (visited[v] === 0) {
            children++;
            GraphAlgorithms.findPoints(adj, v, visited, disc, low, time, u, isAP);

            // Check if the subtree rooted with v has
            // a connection to one of the ancestors of u
            low[u] = Math.min(low[u], low[v]);

            // If u is not root and low value of one of
            // its child is more than discovery value of u.
            if (parent !== -1 && low[v] >= disc[u])
                isAP[u] = 1;
        }

        // Update low value of u for parent function calls.
        else if (v !== parent)
            low[u] = Math.min(low[u], disc[v]);
    }

    // If u is root of DFS tree and has two or more children.
    if (parent === -1 && children > 1)
        isAP[u] = 1;
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
