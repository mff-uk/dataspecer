import { GraphAlgorithms } from "../graph-algoritms";
import { IMainGraphClassic } from "../graph-iface";
import { LayoutAlgorithm, LayoutMethod } from "../layout-iface";
import { Direction } from "../util/utils";
import { ALGORITHM_NAME_TO_LAYOUT_MAPPING, ConstraintContainer } from "./constraint-container";
import { AlgorithmConfiguration, IGraphConversionConstraint, IAlgorithmConfiguration, IAlgorithmOnlyConstraint, IConstraintSimple, UserGivenAlgorithmConfiguration, UserGivenAlgorithmConfigurationslVersion2, UserGivenAlgorithmConfigurationslVersion4, GraphConversionConstraint, RandomConfiguration, getDefaultUserGivenConstraintsVersion4, AlgorithmPhases, ClusterifyConstraint, LayoutClustersActionConstraint, SpecificGraphConversions } from "./constraints";
import { ElkForceConfiguration, ElkLayeredConfiguration, ElkRadialConfiguration, ElkSporeCompactionConfiguration, ElkSporeOverlapConfiguration, ElkStressConfiguration } from "./elk/elk-constraints";


function getOverlapConfigurationToRunAfterMainAlgorithm() {
    const overlapConfiguration: UserGivenAlgorithmConfiguration = {
        layout_alg: "elk_overlapRemoval",
        interactive: true,
        advanced_settings: undefined,
        alg_direction: Direction.Up,
        layer_gap: 0,
        in_layer_gap: 0,
        edge_routing: "ORTHOGONAL",
        stress_edge_len: 0,
        number_of_new_algorithm_runs: 0,
        min_distance_between_nodes: 50,         // Can be played with
        force_alg_type: "FRUCHTERMAN_REINGOLD",
        constraintedNodes: "ALL",
        should_be_considered: false,
        run_layered_after: false
    }

    return new ElkSporeOverlapConfiguration(overlapConfiguration, true);
}


/**
 * This factory class takes care of creating constraints based on given configuration
 */
class AlgorithmConstraintFactory {
    static getLayoutMethodForAlgorithmConstraint(algConstraint: AlgorithmConfiguration): LayoutMethod {
        if(algConstraint instanceof ElkStressConfiguration) {
            throw new Error("Not implemented - Should return the layout method for Elk Stress algorithm");
        }
        else {
            throw new Error("Not implemented - Define for the rest of the Algorithms");
        }
    }


    private static getRandomLayoutConfiguration(userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration,
                                                shouldCreateNewGraph: boolean,
                                                algorithmPhasesToCall?: AlgorithmPhases): IAlgorithmConfiguration {

        return new RandomConfiguration(userGivenAlgorithmConfiguration.constraintedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
    }

    static addAlgorithmConfigurationLayoutActions(
        userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration,
        layoutActionsBeforeMainRun: (IAlgorithmConfiguration | IGraphConversionConstraint)[] | null,
        layoutActionsToSet: (IAlgorithmConfiguration | IGraphConversionConstraint)[],
        shouldCreateNewGraph: boolean
    ): void {
        if(!userGivenAlgorithmConfiguration.should_be_considered) {
            return null;
        }
        switch(userGivenAlgorithmConfiguration.layout_alg) {
            case "elk_stress":
                const elkStress = new ElkStressConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph);
                if(userGivenAlgorithmConfiguration.number_of_new_algorithm_runs > 1) {
                    layoutActionsToSet.push(AlgorithmConstraintFactory.getRandomLayoutConfiguration(userGivenAlgorithmConfiguration, true));
                    elkStress.addAlgorithmConstraint("interactive", "true");
                }
                layoutActionsToSet.push(elkStress);
                layoutActionsToSet.push(getOverlapConfigurationToRunAfterMainAlgorithm());
                break;
            case "elk_layered":
                layoutActionsToSet.push(new ElkLayeredConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "elk_force":
                if(userGivenAlgorithmConfiguration.number_of_new_algorithm_runs > 1) {
                    layoutActionsToSet.push(new ElkForceConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph, "ONLY-RUN"));
                }
                else {
                    layoutActionsToSet.push(new ElkForceConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                }
                layoutActionsToSet.push(getOverlapConfigurationToRunAfterMainAlgorithm());
                break;
            case "random":
                layoutActionsToSet.push(AlgorithmConstraintFactory.getRandomLayoutConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                layoutActionsToSet.push(getOverlapConfigurationToRunAfterMainAlgorithm());
                break;
            case "sporeCompaction":
                layoutActionsToSet.push(new ElkSporeCompactionConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                layoutActionsToSet.push(getOverlapConfigurationToRunAfterMainAlgorithm());
                break;
            case "elk_radial":
                layoutActionsToSet.push(GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("TREEIFY"));
                layoutActionsToSet.push(new ElkRadialConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                layoutActionsToSet.push(getOverlapConfigurationToRunAfterMainAlgorithm());
                break;
            case "elk_overlapRemoval":
                layoutActionsToSet.push(new ElkSporeOverlapConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "elk_stress_advanced_using_clusters":
                const elkStressUsingClusters = new ElkStressConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph);
                if(userGivenAlgorithmConfiguration.number_of_new_algorithm_runs > 1) {
                    layoutActionsToSet.push(AlgorithmConstraintFactory.getRandomLayoutConfiguration(userGivenAlgorithmConfiguration, true));
                    elkStressUsingClusters.addAlgorithmConstraint("interactive", "true");
                }
                layoutActionsToSet.push(elkStressUsingClusters);
                layoutActionsToSet.push(getOverlapConfigurationToRunAfterMainAlgorithm());
                const layoutClustersAction = GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("LAYOUT_CLUSTERS_ACTION");
                const clusterifyAction = layoutActionsBeforeMainRun
                    .find(action => (action as IGraphConversionConstraint)?.actionName === "CLUSTERIFY");
                if(clusterifyAction === undefined) {
                    throw new Error("Missing CLUSTERIFY");
                }
                (layoutClustersAction as LayoutClustersActionConstraint).data.clusterifyConstraint = clusterifyAction as ClusterifyConstraint;
                layoutActionsToSet.push(layoutClustersAction);
                break;
            default:
                throw new Error("Implementation error You forgot to extend the AlgorithmConstraintFactory factory for new algorithm");
        }

        if(userGivenAlgorithmConfiguration.run_layered_after) {
            const configLayeredAfter = getDefaultUserGivenConstraintsVersion4();
            configLayeredAfter.chosenMainAlgorithm = "elk_layered";
            configLayeredAfter.main.elk_layered.interactive = true;
            configLayeredAfter.main.elk_layered.constraintedNodes = userGivenAlgorithmConfiguration.constraintedNodes;
            AlgorithmConstraintFactory.addAlgorithmConfigurationLayoutActions(
                configLayeredAfter.main.elk_layered, layoutActionsBeforeMainRun, layoutActionsToSet, false);
        }
    }

    static addToLayoutActionsInPreMainRunBasedOnConfiguration(
        config: UserGivenAlgorithmConfigurationslVersion4,
        layoutActionsBeforeMainRun: (IAlgorithmConfiguration | IGraphConversionConstraint)[],
    ): void {
        if(config.general.elk_layered.should_be_considered) {
            const convertGeneralizationSubgraphs = GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("CREATE_GENERALIZATION_SUBGRAPHS");
            layoutActionsBeforeMainRun.push(convertGeneralizationSubgraphs);
        }
        // TODO: Not using the config.mainStepNumber and config.generalStepNumber, but that is only for future proofing anyways
        AlgorithmConstraintFactory.addAlgorithmConfigurationLayoutActions(
            config.general.elk_layered, layoutActionsBeforeMainRun, layoutActionsBeforeMainRun, true);

        switch(config.chosenMainAlgorithm) {
            case "elk_stress":
                break;
            case "elk_layered":
                break;
            case "elk_force":
                layoutActionsBeforeMainRun.push(new ElkForceConfiguration(config.main[config.chosenMainAlgorithm], true, "ONLY-PREPARE"));
                break;
            case "random":
                break;
            case "sporeCompaction":
                break;
            case "elk_radial":
                break;
            case "elk_overlapRemoval":
                break;
            case "elk_stress_advanced_using_clusters":
                layoutActionsBeforeMainRun.push(GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("CLUSTERIFY"));
                break;
            default:
                throw new Error("Implementation error You forgot to extend the AlgorithmConstraintFactory factory for new algorithm");
        }
        if(config.chosenMainAlgorithm === "elk_force") {
            layoutActionsBeforeMainRun.push(new ElkForceConfiguration(config.main[config.chosenMainAlgorithm], true, "ONLY-PREPARE"));
        }
    }

    static addToLayoutActionsInMainRunBasedOnConfiguration(
        config: UserGivenAlgorithmConfigurationslVersion4,
        layoutActionsBeforeMainRun: (IAlgorithmConfiguration | IGraphConversionConstraint)[],
        layoutActions: (IAlgorithmConfiguration | IGraphConversionConstraint)[],
    ): void {
        AlgorithmConstraintFactory.addAlgorithmConfigurationLayoutActions(
            config.main[config.chosenMainAlgorithm], layoutActionsBeforeMainRun, layoutActions, false);
    }


    static createSimpleConstraintsFromConfigurationInMainRun(
        userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration
    ): IConstraintSimple[] | null {
        if(!userGivenAlgorithmConfiguration.should_be_considered) {
            return null;
        }

        const result: IConstraintSimple[] = [];

        // TODO RadStr: .... This is not nice - remove the simple constraints - it will make it so much better - I think

        // TODO: I currently also have to check the type, because there is one state for all algorithms so when I change the algorithm type I still have the data from the old one
        //       in this case I can for example have number_of_new_algorithm_runs > 1 for layered algorithm, which isn't what I want, since it is deterministic
        if(userGivenAlgorithmConfiguration.number_of_new_algorithm_runs > 1 &&
            (userGivenAlgorithmConfiguration.layout_alg === "elk_stress" ||
                userGivenAlgorithmConfiguration.layout_alg === "elk_force" ||
                userGivenAlgorithmConfiguration.layout_alg === "elk_stress_advanced_using_clusters")) {
            const numberOfAlgorithmRunsConstraint: IConstraintSimple = {
                constraintedNodes: "ALL",
                type: "control-flow-change",
                constraintTime: "IN-MAIN",
                name: "Best layout iteration count",
                data: { numberOfAlgorithmRuns: userGivenAlgorithmConfiguration.number_of_new_algorithm_runs }
            };
            result.push(numberOfAlgorithmRunsConstraint)
        }

        return result
    }
}


/**
 * Class with static methods to create {@link ConstraintContainer}s
 */
export class ConstraintFactory {
    /**
     *
     * @param config
     * @returns {@link ConstraintContainer} for the whole graph based on given {@link config}.
     */
    static createConstraints(config: UserGivenAlgorithmConfigurationslVersion4): ConstraintContainer {
        const layoutActionsBeforeMainRun: (IAlgorithmConfiguration | IGraphConversionConstraint)[] = [];
        const layoutActions: (IAlgorithmConfiguration | IGraphConversionConstraint)[] = [];

        AlgorithmConstraintFactory.addToLayoutActionsInPreMainRunBasedOnConfiguration(
            config, layoutActionsBeforeMainRun);

        // We can't both have interactive layout and perform search for best algorithm
        // TODO: So just a bit of a hack now!!, to use only 1 run in such case and then set it back to original value so dialog doesn't change on reopen
        const originalNumberOfNewAlgorithmRuns = config.main[config.chosenMainAlgorithm].number_of_new_algorithm_runs;
        if(config.main[config.chosenMainAlgorithm].interactive === true &&
           config.chosenMainAlgorithm !== "elk_stress_advanced_using_clusters") {
            config.main[config.chosenMainAlgorithm].number_of_new_algorithm_runs = 1;
        }

        AlgorithmConstraintFactory.addToLayoutActionsInMainRunBasedOnConfiguration(config, layoutActionsBeforeMainRun, layoutActions);

        const simpleConstraints = AlgorithmConstraintFactory.createSimpleConstraintsFromConfigurationInMainRun(config.main[config.chosenMainAlgorithm]);
        const constraintContainer = new ConstraintContainer(layoutActionsBeforeMainRun, layoutActions, simpleConstraints, undefined, undefined);

        console.info("config", config);
        console.info("layoutActions", layoutActions);

        config.main[config.chosenMainAlgorithm].number_of_new_algorithm_runs = originalNumberOfNewAlgorithmRuns;

        return constraintContainer
    }
}




export type SpecificGraphConversionMethod = (algorithmConversionConstraint: GraphConversionConstraint, graph: IMainGraphClassic) => Promise<IMainGraphClassic>;

// TODO: Not using the shouldCreateNewGraph property
export const SPECIFIC_ALGORITHM_CONVERSIONS_MAP: Record<SpecificGraphConversions, SpecificGraphConversionMethod> = {
    CREATE_GENERALIZATION_SUBGRAPHS: async (
        algorithmConversionConstraint: GraphConversionConstraint,
        graph: IMainGraphClassic
    ): Promise<IMainGraphClassic> => {
        graph.createGeneralizationSubgraphs();
        return Promise.resolve(graph);
    },
    TREEIFY: async (
        algorithmConversionConstraint: GraphConversionConstraint,
        graph: IMainGraphClassic
    ): Promise<IMainGraphClassic> => {
        GraphAlgorithms.treeify(graph);
        return Promise.resolve(graph);
    },
    CLUSTERIFY: async (
        algorithmConversionConstraint: ClusterifyConstraint,
        graph: IMainGraphClassic
    ): Promise<IMainGraphClassic> => {
        const clusteredEdges = GraphAlgorithms.clusterify(graph);
        algorithmConversionConstraint.data.clusters = clusteredEdges;
        return Promise.resolve(graph);
    },
    LAYOUT_CLUSTERS_ACTION: async (
        algorithmConversionConstraint: LayoutClustersActionConstraint,
        graph: IMainGraphClassic
    ): Promise<IMainGraphClassic> => {
        console.info("algorithmConversionConstraint.data.clusterifyConstraint.data.clusters", algorithmConversionConstraint.data.clusterifyConstraint.data.clusters);

        for(const [cluster, edgesInCluster] of Object.entries(algorithmConversionConstraint.data.clusterifyConstraint.data.clusters)) {
            const clusterRoot = { ...graph.findNodeInAllNodes(cluster) };
            const sectorPopulations = GraphAlgorithms.findSectorNodePopulation(graph, clusterRoot, NodeFilter.OnlyNotLayouted);
            const leastPopulatedSector = Object.entries(sectorPopulations)
                .sort(([, edgesA], [, edgesB]) => edgesA - edgesB)         // Ascending order
                .splice(0, 1)[0][0];

            console.info("sectorPopulations", leastPopulatedSector, Direction[leastPopulatedSector as keyof typeof Direction], sectorPopulations);

            for(const node of graph.allNodes) {
                const isInCluster = edgesInCluster
                    .find(edge => edge.start.id === node.id || edge.end.id === node.id) !== undefined;
                if(isInCluster) {
                    node.isConsideredInLayout = true;
                }
                else {
                    node.isConsideredInLayout = false;
                }
            }
            for(const edge of graph.allEdges) {
                const isInCluster = edgesInCluster.includes(edge);
                if(isInCluster) {
                    edge.isConsideredInLayout = true;
                }
                else {
                    edge.isConsideredInLayout = false;
                }
            }

            // TODO RadStr: I have to rewrite this somehow, it does not work without the iterator which is not nice -
            //                  either put it all in some method like in main, which will be just called and the iteration will take place - that seems like the correct solution actually
            //                  or rewrite it so it can run even without the iterator - that is I just call the prepare and run without the iterator
            const layeredAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING["elk_layered"];
            const configuration = getDefaultUserGivenConstraintsVersion4();
            configuration.main.elk_layered.alg_direction = Direction[leastPopulatedSector as keyof typeof Direction];
            const constraintContainer = ConstraintFactory.createConstraints(configuration);
            for(const action of constraintContainer.layoutActionsIterator) {
                if(action instanceof AlgorithmConfiguration) {
                    if(action.algorithmPhasesToCall === "ONLY-PREPARE" || action.algorithmPhasesToCall === "PREPARE-AND-RUN") {
                        layeredAlgorithm.prepareFromGraph(graph, constraintContainer);
                    }
                    if(action.algorithmPhasesToCall === "ONLY-RUN" || action.algorithmPhasesToCall === "PREPARE-AND-RUN") {
                        graph = await layeredAlgorithm.run(false);
                    }
                }
            }
        }

        return Promise.resolve(graph);
        // TODO RadStr: Remove
        // for(const node of graph.allNodes) {
        //     node.completeVisualNode.coreVisualNode.position = {
        //         x: algorithmConversionConstraint.data.clusterifyConstraint.data.clusters[0][1].start.completeVisualNode.coreVisualNode.position.x,
        //         y: 100,
        //         anchored: null
        //     };
        // }
    }
}
