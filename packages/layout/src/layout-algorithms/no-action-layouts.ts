import { ConstraintContainer } from "../configs/constraint-container";
import { IGraphClassic, IMainGraphClassic, MainGraphClassic } from "../graph/representation/graph";
import { LayoutAlgorithm } from "./layout-algorithm-interface";

export class NoActionLayout implements LayoutAlgorithm {
  prepareFromGraph(graph: IGraphClassic, _constraintContainer: ConstraintContainer) {
    this.graph = graph;
  };
  run(shouldCreateNewGraph: boolean) {
    return Promise.resolve(this.graph.mainGraph);
  };
  runGeneralizationLayout(shouldCreateNewGraph: boolean) {
    return Promise.resolve(this.graph.mainGraph);
  };

  private graph: IGraphClassic;
}