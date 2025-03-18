import { ConstraintContainer } from "../configs/constraint-container";
import { AlgorithmConfiguration, AutomaticConfiguration, IAlgorithmConfiguration } from "../configs/constraints";
import { Graph, MainGraph, DefaultMainGraph } from "../graph/representation/graph";
import { LayoutAlgorithm } from "./layout-algorithm-interface";

export class AutomaticLayout implements LayoutAlgorithm {
  prepareFromGraph(graph: Graph, constraintContainer: ConstraintContainer) {
    this.graph = graph;
    this.constraintContainer = constraintContainer;
  };
  run(shouldCreateNewGraph: boolean) {
    console.info("Running automatic", this.constraintContainer.currentLayoutAction.action);
    // TODO RadStr: Put Away the interface (IAlogrithmConfiguration and same for the IGraphConstraint)
    if(this.constraintContainer.currentLayoutAction.action instanceof AutomaticConfiguration) {
      console.info("Running automatic - AutomaticConfiguration", this.constraintContainer.currentLayoutAction);
    }
    else {
      console.error("Wrong configuration for automatic layout")
    }
    // Here we run every algorithm once and choose the best one - we could implement it in the index.js

    return Promise.resolve(this.graph.mainGraph);
  };
  runGeneralizationLayout(shouldCreateNewGraph: boolean) {
    return Promise.resolve(this.graph.mainGraph);
  };

  private graph: Graph;
  private constraintContainer: ConstraintContainer;
}