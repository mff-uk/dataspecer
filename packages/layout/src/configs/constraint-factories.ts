import { getBestLayoutFromMetricResultAggregation, performLayoutFromGraph } from "..";
import { GraphAlgorithms, ToConsiderFilter } from "../graph-algoritms";
import { MainGraph } from "../graph/representation/graph";
import { LayoutMethod } from "../layout-algorithms/layout-algorithm-interface";
import { NoActionLayout } from "../layout-algorithms/no-action-layouts";
import { Direction, reverseDirection } from "../util/utils";
import { ConstraintContainer } from "./constraint-container";
import {
    AlgorithmConfiguration,
    IGraphConversionConstraint,
    IAlgorithmConfiguration,
    IConstraint,
    UserGivenAlgorithmConfiguration,
    UserGivenAlgorithmConfigurationslVersion4,
    GraphConversionConstraint,
    RandomConfiguration,
    getDefaultUserGivenConstraintsVersion4,
    AlgorithmPhases,
    ClusterifyConstraint,
    LayoutClustersActionConstraint,
    SpecificGraphConversions,
    getDefaultMainUserGivenAlgorithmConstraint,
    UserGivenAlgorithmConfigurationStress,
    AutomaticConfiguration
} from "./constraints";
import {
    ElkForceConfiguration,
    ElkLayeredConfiguration,
    ElkRadialConfiguration,
    ElkSporeCompactionConfiguration,
    ElkSporeOverlapConfiguration,
    ElkStressConfiguration
} from "./elk/elk-constraints";


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
                layoutActionsToSet.push(GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("RESET_LAYOUT"));
                layoutActionsToSet.push(GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("TREEIFY"));
                layoutActionsToSet.push(new ElkRadialConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                layoutActionsToSet.push(getOverlapConfigurationToRunAfterMainAlgorithm());
                break;
            case "elk_overlapRemoval":
                layoutActionsToSet.push(new ElkSporeOverlapConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "elk_stress_advanced_using_clusters":
                const elkStressUsingClusters = new ElkStressConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph);
                layoutActionsToSet.push(AlgorithmConstraintFactory.getRandomLayoutConfiguration(userGivenAlgorithmConfiguration, true));        // TODO RadStr: I should only use this if I don't want the algorithm to use the current positions
                elkStressUsingClusters.addAlgorithmConstraint("interactive", "true");
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
                layoutActionsToSet.push(GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("RESET_LAYOUT"));
                break;
            case "none":
                console.info("The chosen algorithm is none");
                const noActionLayout = this.getRandomLayoutConfiguration(userGivenAlgorithmConfiguration, true);
                noActionLayout.algorithmName = "none";
                layoutActionsToSet.push(noActionLayout);
                break;
            case "automatic":
                console.info("The chosen algorithm is automatic");
                const automaticConfiguration = new AutomaticConfiguration(
                    userGivenAlgorithmConfiguration, shouldCreateNewGraph)
                layoutActionsToSet.push(automaticConfiguration);
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
            case "automatic":
                break;
            case "none":
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

        const constraintContainer = new ConstraintContainer(
            layoutActionsBeforeMainRun, layoutActions, config.main[config.chosenMainAlgorithm].number_of_new_algorithm_runs);

        console.info("config", config);
        console.info("layoutActions", layoutActions);

        config.main[config.chosenMainAlgorithm].number_of_new_algorithm_runs = originalNumberOfNewAlgorithmRuns;

        return constraintContainer
    }
}




export type SpecificGraphConversionMethod = (algorithmConversionConstraint: GraphConversionConstraint, graph: MainGraph) => Promise<MainGraph>;

// TODO: Not using the shouldCreateNewGraph property
export const SPECIFIC_ALGORITHM_CONVERSIONS_MAP: Record<SpecificGraphConversions, SpecificGraphConversionMethod> = {
    CREATE_GENERALIZATION_SUBGRAPHS: async (
        algorithmConversionConstraint: GraphConversionConstraint,
        graph: MainGraph
    ): Promise<MainGraph> => {
        graph.createGeneralizationSubgraphs();
        return Promise.resolve(graph);
    },
    TREEIFY: async (
        algorithmConversionConstraint: GraphConversionConstraint,
        graph: MainGraph
    ): Promise<MainGraph> => {
        GraphAlgorithms.treeify(graph);
        return Promise.resolve(graph);
    },
    CLUSTERIFY: async (
        algorithmConversionConstraint: ClusterifyConstraint,
        graph: MainGraph
    ): Promise<MainGraph> => {
        const clusteredEdges = GraphAlgorithms.clusterify(graph);
        algorithmConversionConstraint.data.clusters = clusteredEdges;
        return Promise.resolve(graph);
    },
    LAYOUT_CLUSTERS_ACTION: async (
        algorithmConversionConstraint: LayoutClustersActionConstraint,
        graph: MainGraph
    ): Promise<MainGraph> => {
        console.info("algorithmConversionConstraint.data.clusterifyConstraint.data.clusters", algorithmConversionConstraint.data.clusterifyConstraint.data.clusters);

        for (const [cluster, edgesInCluster] of Object.entries(algorithmConversionConstraint.data.clusterifyConstraint.data.clusters)) {
            for (const node of graph.allNodes) {
                const isInCluster = edgesInCluster
                    .find(edge => edge.start.id === node.id || edge.end.id === node.id) !== undefined;
                if (isInCluster) {
                    node.isConsideredInLayout = true;
                }
                else {
                    node.isConsideredInLayout = false;
                }
            }
            for (const edge of graph.allEdges) {
                const isInCluster = edgesInCluster.findIndex(edgeInCluster => edgeInCluster.id === edge.id) >= 0;
                if (isInCluster) {
                    edge.isConsideredInLayout = true;
                    if(edge.start.id !== cluster) {
                        edge.reverseInLayout = true;
                    }
                }
                else {
                    edge.isConsideredInLayout = false;
                }
            }

            const clusterRoot = graph.findNodeInAllNodes(cluster);
            const clusterRootPositionBeforeLayout = { ...clusterRoot.completeVisualNode.coreVisualNode.position };
            // TODO RadStr: Commented code - old variant
            const sectorPopulations = GraphAlgorithms.findSectorNodePopulation(graph, clusterRoot, edgesInCluster, ToConsiderFilter.OnlyNotLayouted);
            const sectorPopulationsEdges = GraphAlgorithms.findSectorEdgePopulation(graph, clusterRoot, edgesInCluster, ToConsiderFilter.OnlyNotLayouted);
            Object.entries(sectorPopulationsEdges).forEach(([sector, population]) => {
                sectorPopulations[sector as Direction] += population;
            });
            const populatedSectorsAscending = Object.entries(sectorPopulations)
                .sort(([, edgesA], [, edgesB]) => edgesA - edgesB);

            let leastPopulatedSector = populatedSectorsAscending[0][0];
            if((populatedSectorsAscending[0][0] === "UP" || populatedSectorsAscending[0][0] === "DOWN") &&
                (populatedSectorsAscending[1][0] === "LEFT" || populatedSectorsAscending[1][0] === "RIGHT") &&
                populatedSectorsAscending[0][1] === populatedSectorsAscending[1][1]) {
                leastPopulatedSector = populatedSectorsAscending[1][0];
            }

            // TODO RadStr: Debug print
            console.info("sectorPopulations", clusterRoot?.semanticEntityRepresentingNode?.iri, leastPopulatedSector, sectorPopulations);

            const configuration = getDefaultUserGivenConstraintsVersion4();
            configuration.main.elk_layered.alg_direction = leastPopulatedSector as Direction;
            configuration.main.elk_layered.in_layer_gap = 100;
            configuration.main.elk_layered.layer_gap = 50;
            configuration.main.elk_layered.edge_routing = "POLYLINE";
            graph = await getBestLayoutFromMetricResultAggregation(await performLayoutFromGraph(graph, configuration));

            const clusterRootAfterLayout = graph.findNodeInAllNodes(clusterRoot.id);
            const clusterRoorPositionAfterLayout = clusterRootAfterLayout.completeVisualNode.coreVisualNode.position;
            const positionShift = {
                x: clusterRoorPositionAfterLayout.x - clusterRootPositionBeforeLayout.x,
                y: clusterRoorPositionAfterLayout.y - clusterRootPositionBeforeLayout.y,
            };
            for (const node of graph.allNodes) {
                if (node.isConsideredInLayout) {
                    const nodePosition = node.completeVisualNode.coreVisualNode.position;
                    nodePosition.x -= positionShift.x;
                    nodePosition.y -= positionShift.y;
                }
            }
            for (const edge of graph.allEdges) {
                if (edge.isConsideredInLayout) {
                    for (const waypoint of edge.visualEdge.visualEdge.waypoints) {
                        waypoint.x -= positionShift.x;
                        waypoint.y -= positionShift.y;
                    }
                }
            }
        }

        graph.resetForNewLayout();
        for (const [cluster, edgesInCluster] of Object.entries(algorithmConversionConstraint.data.clusterifyConstraint.data.clusters)) {
            for (const node of graph.allNodes) {
                const isInCluster = node.id === cluster || edgesInCluster
                    .find(edge => edge.start.id === node.id || edge.end.id === node.id) !== undefined;
                if (isInCluster) {
                    node.completeVisualNode.isAnchored = true;
                }
            }
        }

        const configuration = getDefaultUserGivenConstraintsVersion4();
        configuration.chosenMainAlgorithm = "elk_stress";
        configuration.main.elk_stress = getDefaultMainUserGivenAlgorithmConstraint("elk_stress");
        configuration.main.elk_stress.interactive = true;
        (configuration.main.elk_stress as UserGivenAlgorithmConfigurationStress).stress_edge_len = 800;
        graph = await getBestLayoutFromMetricResultAggregation(await performLayoutFromGraph(graph, configuration));

        return Promise.resolve(graph);
        // TODO RadStr: Remove
        // for(const node of graph.allNodes) {
        //     node.completeVisualNode.coreVisualNode.position = {
        //         x: algorithmConversionConstraint.data.clusterifyConstraint.data.clusters[0][1].start.completeVisualNode.coreVisualNode.position.x,
        //         y: 100,
        //         anchored: null
        //     };
        // }
    },
    RESET_LAYOUT: function (algorithmConversionConstraint: GraphConversionConstraint, graph: MainGraph): Promise<MainGraph> {
        graph.mainGraph.resetForNewLayout();
        return Promise.resolve(graph);
    }
}
