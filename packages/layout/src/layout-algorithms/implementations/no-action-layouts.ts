import { ConfigurationsContainer } from "../../configurations/configurations-container.ts";
import { Graph } from "../../graph/representation/graph.ts";
import { LayoutAlgorithm } from "../layout-algorithms-interfaces.ts";

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