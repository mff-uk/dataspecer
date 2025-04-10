import _ from "lodash";
import { AlgorithmName, getBestMetricResultAggregation, performLayoutFromGraph } from "../..";
import { ConstraintContainer } from "../../configs/constraint-container";
import { AutomaticConfiguration, getDefaultUserGivenAlgorithmConfigurationsFull } from "../../configs/constraints";
import { Graph, MainGraph } from "../../graph/representation/graph";
import { LayoutAlgorithm } from "../layout-algorithms-interfaces";

export class AutomaticLayout implements LayoutAlgorithm {
  prepareFromGraph(graph: Graph, constraintContainer: ConstraintContainer): void {
    this.graph = graph;
    this.constraintContainer = constraintContainer;
  };
  async run(): Promise<MainGraph> {
    let bestGraph = null;
    // Here we run every algorithm once and choose the best one - we could implement it in the index.js
    if(this.constraintContainer.currentLayoutAction.action instanceof AutomaticConfiguration) {
      console.info("Running automatic - AutomaticConfiguration", this.constraintContainer.currentLayoutAction.action);
      const algorithmsToTry = getAlgorithmsToTry(this.constraintContainer.currentLayoutAction.action.data.min_distance_between_nodes);
      let best = 10000000;
      for(const algorithmToTry of algorithmsToTry) {
        const graphCopy = _.cloneDeep(this.graph.mainGraph);
        const result = await performLayoutFromGraph(graphCopy, algorithmToTry);
        const currentMetricResult = getBestMetricResultAggregation(result);
        // TODO Hard to solve by myself - Radstr: If we swap to relativeValue we have to use < and change the best to -1000...
        if(currentMetricResult.value.absoluteValue < best) {
          best = currentMetricResult.value.absoluteValue;
          bestGraph = currentMetricResult.graphPromise;
        }
      }
    }
    else {
      console.error("Wrong configuration for automatic layout")
    }

    return bestGraph;
  };
  runGeneralizationLayout() {
    return Promise.resolve(this.graph.mainGraph);
  };

  private graph: Graph;
  private constraintContainer: ConstraintContainer;
}

function getAlgorithmsToTry(edgeLength: number) {
  let chosenAlgorithmNames: AlgorithmName[] = [
    "elk_stress",
    "elk_stress_advanced_using_clusters",
    "elk_radial",
    "elk_overlapRemoval",
  ];
  const algorithms = [];

  for(const chosenAlgorithm of chosenAlgorithmNames) {
    const config = getDefaultUserGivenAlgorithmConfigurationsFull();
    config.chosenMainAlgorithm = chosenAlgorithm;
    if(chosenAlgorithm === "elk_stress" || chosenAlgorithm === "elk_stress_advanced_using_clusters") {
      config.main[chosenAlgorithm].number_of_new_algorithm_runs = 1;
      config.main[chosenAlgorithm].stress_edge_len = edgeLength;
    }
    if(chosenAlgorithm === "elk_overlapRemoval" || chosenAlgorithm === "elk_radial") {
      config.main[chosenAlgorithm].min_distance_between_nodes = edgeLength;
    }
    algorithms.push(config);
  }

  return algorithms;
}