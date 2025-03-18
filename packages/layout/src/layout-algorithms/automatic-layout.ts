import _ from "lodash";
import { getBestLayoutFromMetricResultAggregation, getBestMetricResultAggregation, performLayoutFromGraph } from "..";
import { AlgorithmName, ConstraintContainer } from "../configs/constraint-container";
import { ConstraintFactory } from "../configs/constraint-factories";
import { AlgorithmConfiguration, AutomaticConfiguration, getDefaultMainUserGivenAlgorithmConstraint, getDefaultUserGivenConstraintsVersion4, IAlgorithmConfiguration } from "../configs/constraints";
import { Graph, MainGraph, DefaultMainGraph } from "../graph/representation/graph";
import { LayoutAlgorithm } from "./layout-algorithm-interface";

export class AutomaticLayout implements LayoutAlgorithm {
  prepareFromGraph(graph: Graph, constraintContainer: ConstraintContainer) {
    this.graph = graph;
    this.constraintContainer = constraintContainer;
  };
  async run(shouldCreateNewGraph: boolean) {
    // TODO RadStr: Put Away the interface (IAlogrithmConfiguration and same for the IGraphConstraint)
    let bestGraph = null;
    // Here we run every algorithm once and choose the best one - we could implement it in the index.js
    if(this.constraintContainer.currentLayoutAction.action instanceof AutomaticConfiguration) {
      console.info("Running automatic - AutomaticConfiguration", this.constraintContainer.currentLayoutAction.action);
      const algorithmsToTry = getAlgorithmsToTry(this.constraintContainer.currentLayoutAction.action.data.min_distance_between_nodes);
      let best = -10000000;
      const graphCopy = _.cloneDeep(this.graph.mainGraph);
      for(const algorithmToTry of algorithmsToTry) {
        const result = await performLayoutFromGraph(graphCopy, algorithmToTry);
        const currentMetricResult = getBestMetricResultAggregation(result);
        if(currentMetricResult.value > best) {
          best = currentMetricResult.value;
          bestGraph = currentMetricResult.graphPromise;
        }
      }
    }
    else {
      console.error("Wrong configuration for automatic layout")
    }

    return bestGraph;
  };
  runGeneralizationLayout(shouldCreateNewGraph: boolean) {
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
    const config = getDefaultUserGivenConstraintsVersion4();
    config.main[chosenAlgorithm] = getDefaultMainUserGivenAlgorithmConstraint(chosenAlgorithm);
    config.chosenMainAlgorithm = chosenAlgorithm;
    config.main[chosenAlgorithm].number_of_new_algorithm_runs = 1;
    config.main[chosenAlgorithm].stress_edge_len = edgeLength;
    config.main[chosenAlgorithm].min_distance_between_nodes = edgeLength;
    algorithms.push(config);
  }

  return algorithms;
}