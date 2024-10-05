import { GraphClassic } from "./graph-iface";

type Dimensions = {
    width: number,
    height: number
};

class GraphAlgorithms {
    dfs(graph: GraphClassic, root: string, edgeType: "TODO" | "GENERALIZATION"): string[] {
        throw new Error("Unimplemented");
    }
    bfs(graph: GraphClassic, root: string, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    findStrongComponents(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    findWeakComponents(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    computeJacardSimilarity(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION"): string[][] {
        throw new Error("Unimplemented");
    }
    findLeaves(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION"): string[] {
        throw new Error("Unimplemented");
    }
    treeify(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION"): GraphClassic {       // TODO: ?
        throw new Error("Unimplemented");
    }
    getSubgraphUsingBFS(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION", depth: number): GraphClassic {
        throw new Error("Unimplemented");
    }
    findCliques(graph: GraphClassic, edgeType: "TODO" | "GENERALIZATION", size: number): GraphClassic {      // TODO:
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