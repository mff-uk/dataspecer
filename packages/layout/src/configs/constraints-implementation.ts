import { getDefaultUserGivenConstraintsVersion2, NodeDimensionQueryHandler, UserGivenConstraintsVersion2 } from "..";
import { IMainGraphClassic } from "../graph-iface";
import { LayoutAlgorithm } from "../layout-iface";
import { ALGORITHM_NAME_TO_LAYOUT_MAPPING } from "./constraint-container";
import { ConstraintFactory } from "./constraint-factories";

export const compactify = async (graph: IMainGraphClassic, nodeDimensionQueryHandler: NodeDimensionQueryHandler) => {
    const config: UserGivenConstraintsVersion2 = getDefaultUserGivenConstraintsVersion2();
    config.main.layout_alg = "sporeCompaction";
    config.main.min_distance_between_nodes = 64;



    const constraints = ConstraintFactory.createConstraints(config);
    const mainLayoutAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[constraints.algorithmOnlyConstraints["ALL"].algorithmName];


    mainLayoutAlgorithm.prepareFromGraph(graph, constraints, nodeDimensionQueryHandler);
    // TODO: 1) Doesn't work for subgraphs, since it can not handle this case subgraph: [n1] ... n1 -> subgraph ... so edge going from node inside of subgraph to the subgraph
    //       2) It should be used as the main algorithm with parameter underlying algorithm
    const layoutedGraphPromise: Promise<IMainGraphClassic> = mainLayoutAlgorithm.run(false);
    return layoutedGraphPromise.then(_ => {});
}