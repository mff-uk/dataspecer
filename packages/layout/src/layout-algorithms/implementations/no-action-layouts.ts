import { ConfigurationsContainer } from "../../configurations/configurations-container";
import { Graph } from "../../graph/representation/graph";
import { LayoutAlgorithm } from "../layout-algorithms-interfaces";

export class NoActionLayout implements LayoutAlgorithm {
  prepareFromGraph(graph: Graph, _configurations: ConfigurationsContainer) {
    this.graph = graph;
  };
  run() {
    console.info("Running NoActionLayout");
    return Promise.resolve(this.graph.mainGraph);
  };
  runGeneralizationLayout() {
    return Promise.resolve(this.graph.mainGraph);
  };

  private graph: Graph;
}
