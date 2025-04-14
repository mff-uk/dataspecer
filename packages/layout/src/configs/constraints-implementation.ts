import { getDefaultUserGivenConstraintsVersion2, getDefaultUserGivenConstraintsVersion4, NodeDimensionQueryHandler, UserGivenConstraintsVersion2, UserGivenConstraintsVersion4 } from "../index.ts";
import { IMainGraphClassic } from "../graph-iface.ts";
import { LayoutAlgorithm } from "../layout-iface.ts";
import { ALGORITHM_NAME_TO_LAYOUT_MAPPING, ConstraintContainer } from "./constraint-container.ts";
import { ConstraintFactory } from "./constraint-factories.ts";

export const compactify = async (graph: IMainGraphClassic, mainConstraintContainer: ConstraintContainer) => {
    // TODO: Remake this !!!!!!!!



    // const config: UserGivenConstraintsVersion4 = getDefaultUserGivenConstraintsVersion4();
    // config.chosenMainAlgorithm = "sporeCompaction";
    // config.main["sporeCompaction"].min_distance_between_nodes = 64;

    // const constraints = ConstraintFactory.createConstraints(config);
    // // TODO: It is not main though, I mean it can be, but this usually runs after the main algorithm

    // mainConstraintContainer.addAlgorithmConstraint(constraints.layoutActions[1]);

    // // TODO: The following lines of code should be in the main

    // // const mainLayoutAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[constraints.algorithmOnlyConstraints["ALL"].algorithmName];


    // // mainLayoutAlgorithm.prepareFromGraph(graph, constraints, nodeDimensionQueryHandler);
    // // // TODO: 1) Doesn't work for subgraphs, since it can not handle this case subgraph: [n1] ... n1 -> subgraph ... so edge going from node inside of subgraph to the subgraph
    // // //       2) It should be used as the main algorithm with parameter underlying algorithm
    // // const layoutedGraphPromise: Promise<IMainGraphClassic> = mainLayoutAlgorithm.run(false);
    // // return layoutedGraphPromise.then(_ => {});
}
