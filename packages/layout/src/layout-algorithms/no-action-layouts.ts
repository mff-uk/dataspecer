import { ConstraintContainer } from "../configs/constraint-container";
import { IGraphClassic, IMainGraphClassic, MainGraphClassic } from "../graph-iface";
import { LayoutAlgorithm } from "../layout-iface";

export class NoActionLayout implements LayoutAlgorithm {
  prepareFromGraph(graph: IGraphClassic, constraintContainer: ConstraintContainer) {
    this.graph = graph;
  };
  run(shouldCreateNewGraph: boolean) {
    return Promise.resolve(this.graph.mainGraph);
  };
  runGeneralizationLayout(shouldCreateNewGraph: boolean) {
    return Promise.resolve(this.graph.mainGraph);
  };
  constraintContainer: ConstraintContainer;
  graph: IGraphClassic;
}