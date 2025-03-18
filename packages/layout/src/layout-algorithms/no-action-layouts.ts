import { ConstraintContainer } from "../configs/constraint-container";
import { Graph, MainGraph, DefaultMainGraph } from "../graph/representation/graph";
import { LayoutAlgorithm } from "./layout-algorithm-interface";

export class NoActionLayout implements LayoutAlgorithm {
  prepareFromGraph(graph: Graph, _constraintContainer: ConstraintContainer) {
    this.graph = graph;
  };
  run(shouldCreateNewGraph: boolean) {
    console.info("Running NoActionLayout");
    return Promise.resolve(this.graph.mainGraph);
  };
  runGeneralizationLayout(shouldCreateNewGraph: boolean) {
    return Promise.resolve(this.graph.mainGraph);
  };

  private graph: Graph;
}