import { VisualProfileRelationship, VisualRelationship } from "@dataspecer/core-v2/visual-model";
import { getBestLayoutFromMetricResultAggregation, performLayoutFromGraph, XY } from "..";
import { GraphAlgorithms, ToConsiderFilter } from "../graph-algoritms";
import { EdgeEndPoint } from "../graph/representation/edge";
import { MainGraph } from "../graph/representation/graph";
import { GraphFactory } from "../graph/representation/graph-factory";
import { LayoutMethod } from "../layout-algorithms/layout-algorithms-interfaces";
import { Direction, PhantomElementsFactory, reverseDirection } from "../util/utils";
import { ConstraintContainer } from "./constraint-container";
import {
    DefaultAlgorithmConfiguration,
    GraphConversionConstraint,
    AlgorithmConfiguration,
    UserGivenAlgorithmConfiguration,
    UserGivenAlgorithmConfigurationslVersion4,
    DefaultGraphConversionConstraint,
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
    ElkStressConfiguration,
    ElkStressProfileLayoutConfiguration
} from "./elk/elk-constraints";


function getOverlapConfigurationToRunAfterMainAlgorithm(
    minSpaceBetweenNodes: number | null
) {
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
        min_distance_between_nodes: minSpaceBetweenNodes ?? 50,
        force_alg_type: "FRUCHTERMAN_REINGOLD",
        constraintedNodes: "ALL",
        should_be_considered: false,
        run_layered_after: false,
        run_node_overlap_removal_after: false,

        profileEdgeLength: 0,
        preferredProfileDirection: Direction.Up,
    }

    return new ElkSporeOverlapConfiguration(overlapConfiguration, true);
}


/**
 * This factory class takes care of creating constraints based on given configuration
 */
class AlgorithmConstraintFactory {
    static getLayoutMethodForAlgorithmConstraint(algConstraint: DefaultAlgorithmConfiguration): LayoutMethod {
        if(algConstraint instanceof ElkStressConfiguration) {
            throw new Error("Not implemented - Should return the layout method for Elk Stress algorithm");
        }
        else {
            throw new Error("Not implemented - Define for the rest of the Algorithms");
        }
    }


    private static getRandomLayoutConfiguration(userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration,
                                                shouldCreateNewGraph: boolean,
                                                algorithmPhasesToCall?: AlgorithmPhases): AlgorithmConfiguration {

        return new RandomConfiguration(userGivenAlgorithmConfiguration.constraintedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
    }

    static addAlgorithmConfigurationLayoutActions(
        userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration,
        layoutActionsBeforeMainRun: (AlgorithmConfiguration | GraphConversionConstraint)[] | null,
        layoutActionsToSet: (AlgorithmConfiguration | GraphConversionConstraint)[],
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
                break;
            case "elk_stress_profile":
                const elkStressProfile = new ElkStressProfileLayoutConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph);
                if(userGivenAlgorithmConfiguration.number_of_new_algorithm_runs > 1) {
                    layoutActionsToSet.push(AlgorithmConstraintFactory.getRandomLayoutConfiguration(userGivenAlgorithmConfiguration, true));
                    elkStressProfile.addAlgorithmConstraint("interactive", "true");
                }
                layoutActionsToSet.push(elkStressProfile);
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
                break;
            case "random":
                layoutActionsToSet.push(AlgorithmConstraintFactory.getRandomLayoutConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "sporeCompaction":
                layoutActionsToSet.push(new ElkSporeCompactionConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "elk_radial":
                layoutActionsToSet.push(DefaultGraphConversionConstraint.createSpecificAlgorithmConversionConstraint("RESET_LAYOUT", null));
                layoutActionsToSet.push(DefaultGraphConversionConstraint.createSpecificAlgorithmConversionConstraint("TREEIFY", null));
                layoutActionsToSet.push(new ElkRadialConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "elk_overlapRemoval":
                layoutActionsToSet.push(new ElkSporeOverlapConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph));
                break;
            case "elk_stress_advanced_using_clusters":
                const elkStressUsingClusters = new ElkStressConfiguration(userGivenAlgorithmConfiguration, shouldCreateNewGraph);
                layoutActionsToSet.push(AlgorithmConstraintFactory.getRandomLayoutConfiguration(userGivenAlgorithmConfiguration, true));
                elkStressUsingClusters.addAlgorithmConstraint("interactive", "true");
                layoutActionsToSet.push(elkStressUsingClusters);
                const layoutClustersAction = DefaultGraphConversionConstraint.createSpecificAlgorithmConversionConstraint(
                    "LAYOUT_CLUSTERS_ACTION", userGivenAlgorithmConfiguration);
                const clusterifyAction = layoutActionsBeforeMainRun
                    .find(action => (action as GraphConversionConstraint)?.actionName === "CLUSTERIFY");
                if(clusterifyAction === undefined) {
                    throw new Error("Missing CLUSTERIFY");
                }
                (layoutClustersAction as LayoutClustersActionConstraint).data.clusterifyConstraint = clusterifyAction as ClusterifyConstraint;
                layoutActionsToSet.push(layoutClustersAction);
                layoutActionsToSet.push(DefaultGraphConversionConstraint.createSpecificAlgorithmConversionConstraint("RESET_LAYOUT", null));
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

        if(userGivenAlgorithmConfiguration.run_node_overlap_removal_after) {
            // Just use the deafult small value, I think that it behaves better.
            // Even though the results are "nicer" if we set it the edge length of the physical based algorithm (stress)
            // The nodes are too far from each other, so we lose the compactness and there is no way for us to get it,
            // if we use the length instead of some small default value.
            layoutActionsToSet.push(getOverlapConfigurationToRunAfterMainAlgorithm(null));
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
        layoutActionsBeforeMainRun: (AlgorithmConfiguration | GraphConversionConstraint)[],
    ): void {
        if(config.general.elk_layered.should_be_considered) {
            const convertGeneralizationSubgraphs = DefaultGraphConversionConstraint.createSpecificAlgorithmConversionConstraint("CREATE_GENERALIZATION_SUBGRAPHS", null);
            layoutActionsBeforeMainRun.push(convertGeneralizationSubgraphs);
        }
        AlgorithmConstraintFactory.addAlgorithmConfigurationLayoutActions(
            config.general.elk_layered, layoutActionsBeforeMainRun, layoutActionsBeforeMainRun, true);

        switch(config.chosenMainAlgorithm) {
            case "elk_stress":
                break;
            case "elk_stress_profile":
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
                layoutActionsBeforeMainRun.push(DefaultGraphConversionConstraint.createSpecificAlgorithmConversionConstraint("CLUSTERIFY", null));
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
        layoutActionsBeforeMainRun: (AlgorithmConfiguration | GraphConversionConstraint)[],
        layoutActions: (AlgorithmConfiguration | GraphConversionConstraint)[],
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
        const layoutActionsBeforeMainRun: (AlgorithmConfiguration | GraphConversionConstraint)[] = [];
        const layoutActions: (AlgorithmConfiguration | GraphConversionConstraint)[] = [];

        AlgorithmConstraintFactory.addToLayoutActionsInPreMainRunBasedOnConfiguration(
            config, layoutActionsBeforeMainRun);

        if(config.main[config.chosenMainAlgorithm].interactive === true &&
           config.chosenMainAlgorithm !== "elk_stress_advanced_using_clusters") {
            config.main[config.chosenMainAlgorithm].number_of_new_algorithm_runs = 1;
        }

        AlgorithmConstraintFactory.addToLayoutActionsInMainRunBasedOnConfiguration(config, layoutActionsBeforeMainRun, layoutActions);

        const constraintContainer = new ConstraintContainer(
            layoutActionsBeforeMainRun, layoutActions, config.main[config.chosenMainAlgorithm].number_of_new_algorithm_runs);

        console.info("config", config);
        console.info("layoutActions", layoutActions);

        return constraintContainer
    }
}




export type SpecificGraphConversionMethod = (algorithmConversionConstraint: DefaultGraphConversionConstraint, graph: MainGraph) => Promise<MainGraph>;

export const SPECIFIC_ALGORITHM_CONVERSIONS_MAP: Record<SpecificGraphConversions, SpecificGraphConversionMethod> = {
    CREATE_GENERALIZATION_SUBGRAPHS: async (
        algorithmConversionConstraint: DefaultGraphConversionConstraint,
        graph: MainGraph
    ): Promise<MainGraph> => {
        graph.createGeneralizationSubgraphs();
        return Promise.resolve(graph);
    },
    TREEIFY: async (
        algorithmConversionConstraint: DefaultGraphConversionConstraint,
        graph: MainGraph
    ): Promise<MainGraph> => {
        GraphAlgorithms.treeify(graph);
        return Promise.resolve(graph);
    },
    CLUSTERIFY: async (
        algorithmConversionConstraint: ClusterifyConstraint,
        graph: MainGraph
    ): Promise<MainGraph> => {
        const clusteredEdges = GraphAlgorithms.clusterifyAdvanced(graph, null);
        algorithmConversionConstraint.data.clusters = clusteredEdges;
        return Promise.resolve(graph);
    },
    LAYOUT_CLUSTERS_ACTION: async (
        algorithmConversionConstraint: LayoutClustersActionConstraint,
        graph: MainGraph
    ): Promise<MainGraph> => {
        console.info("algorithmConversionConstraint.data.clusterifyConstraint.data.clusters", algorithmConversionConstraint.data.clusterifyConstraint.data.clusters);

        const visualEdgesWithWaypoints: (VisualRelationship | VisualProfileRelationship)[] = [];

        const clusterPositionsWhenLayoutingLayered: Record<string, XY> = {};

        for (const [cluster, edgesInCluster] of Object.entries(algorithmConversionConstraint.data.clusterifyConstraint.data.clusters)) {
            for (const node of graph.getAllNodesInMainGraph()) {
                const isInCluster = edgesInCluster
                    .find(edge => edge.start.id === node.id || edge.end.id === node.id) !== undefined;
                if (isInCluster) {
                    node.isConsideredInLayout = true;
                }
                else {
                    node.isConsideredInLayout = false;
                }
            }

            for(const edge of graph.getAllEdgesInMainGraph()) {
                edge.isConsideredInLayout = false;
            }

            const edgesInClusterCurrentVersion = edgesInCluster.map(edge => graph.findEdgeInAllEdges(edge.id)).filter(edge => edge !== null);
            for(const edgeInCluster of edgesInClusterCurrentVersion) {
                edgeInCluster.isConsideredInLayout = true;
                // TODO: Debug prints
                if(edgeInCluster?.semanticEntityRepresentingEdge?.id === "http://spdx.org/rdf/terms#externalRef") {
                    console.info("cluster edge http://spdx.org/rdf/terms#externalRef", edgesInClusterCurrentVersion);
                }
                if(edgeInCluster?.semanticEntityRepresentingEdge?.id === "http://spdx.org/rdf/terms#referenceCategory") {
                    console.info("cluster edge http://spdx.org/rdf/terms#referenceCategory", edgesInClusterCurrentVersion);
                }
            }
            GraphAlgorithms.pointAllEdgesFromRoot(cluster, edgesInClusterCurrentVersion);

            // TODO: Debug prints
            console.log("edgesInClusterCurrentVersion", {...edgesInClusterCurrentVersion});


            const clusterRoot = graph.findNodeInAllNodes(cluster);
            const clusterRootPositionBeforeLayout = { ...clusterRoot.completeVisualNode.coreVisualNode.position };
            const sectorPopulations = GraphAlgorithms.findSectorNodePopulation(graph, clusterRoot, edgesInCluster, ToConsiderFilter.OnlyNotLayouted);
            const sectorPopulationsEdges = GraphAlgorithms.findSectorEdgePopulation(graph, clusterRoot, edgesInCluster, ToConsiderFilter.OnlyNotLayouted);
            Object.entries(sectorPopulationsEdges).forEach(([sector, population]) => {
                sectorPopulations[sector as Direction] += population;
            });
            const populatedSectorsAscending = Object.entries(sectorPopulations)
                .sort(([, edgesA], [, edgesB]) => edgesA - edgesB);

            let leastPopulatedSector = populatedSectorsAscending[0][0];
            // It is better to choose vertical direction if the populations are the same
            if((populatedSectorsAscending[1][0] === "UP" || populatedSectorsAscending[1][0] === "DOWN") &&
                (populatedSectorsAscending[0][0] === "LEFT" || populatedSectorsAscending[0][0] === "RIGHT") &&
                populatedSectorsAscending[0][1] === populatedSectorsAscending[1][1]) {
                leastPopulatedSector = populatedSectorsAscending[1][0];
            }

            // TODO RadStr: Debug print
            console.info("sectorPopulations", clusterRoot?.semanticEntityRepresentingNode?.iri, leastPopulatedSector, sectorPopulations);

            const configuration = getDefaultUserGivenConstraintsVersion4();
            configuration.main.elk_layered.alg_direction = leastPopulatedSector as Direction;
            configuration.main.elk_layered.in_layer_gap = 50;
            configuration.main.elk_layered.layer_gap = 200;
            configuration.main.elk_layered.edge_routing = "ORTHOGONAL";
            configuration.main.elk_layered.number_of_new_algorithm_runs = 1;            // TODO RadStr: This is not good - but it will be fixed with new constraints/layout actions
            graph = await getBestLayoutFromMetricResultAggregation(await performLayoutFromGraph(graph, configuration));

            const clusterRootAfterLayout = graph.findNodeInAllNodes(clusterRoot.id);
            const clusterRoorPositionAfterLayout = clusterRootAfterLayout.completeVisualNode.coreVisualNode.position;
            const positionShift = {
                x: clusterRoorPositionAfterLayout.x - clusterRootPositionBeforeLayout.x,
                y: clusterRoorPositionAfterLayout.y - clusterRootPositionBeforeLayout.y,
            };
            for (const node of graph.getAllNodesInMainGraph()) {
                if (node.isConsideredInLayout) {
                    const nodePosition = node.completeVisualNode.coreVisualNode.position;
                    nodePosition.x -= positionShift.x;
                    nodePosition.y -= positionShift.y;
                }
            }
            for (const edge of graph.getAllEdgesInMainGraph()) {
                if (edge.isConsideredInLayout) {
                    for (const waypoint of edge.visualEdge.visualEdge.waypoints) {
                        waypoint.x -= positionShift.x;
                        waypoint.y -= positionShift.y;
                    }

                    visualEdgesWithWaypoints.push({...edge.visualEdge.visualEdge});
                }
            }

            clusterPositionsWhenLayoutingLayered[clusterRoot.id] = clusterRoorPositionAfterLayout;
        }

        graph.resetForNewLayout();
        for (const [cluster, edgesInCluster] of Object.entries(algorithmConversionConstraint.data.clusterifyConstraint.data.clusters)) {
            // Anchor clusters ... alternative solution is to layout subgraphs, but elk doesn't like that
            // (the results are really bad, but maybe that was issue on my side)
            for (const node of graph.getAllNodesInMainGraph()) {
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
        configuration.main.elk_stress.run_node_overlap_removal_after = true;
        (configuration.main.elk_stress as UserGivenAlgorithmConfigurationStress).stress_edge_len = algorithmConversionConstraint.data.edgeLength;
        graph = await getBestLayoutFromMetricResultAggregation(await performLayoutFromGraph(graph, configuration));


        // Keep the orthogonal layout of edges for clusters
        for (const [clusterRoot, clusterRootPositionBefore] of Object.entries(clusterPositionsWhenLayoutingLayered)) {
            const clusterRootPositionCurrent = graph.findNodeInAllNodes(clusterRoot).completeVisualNode.coreVisualNode.position;
            const positionShift = {
                x: clusterRootPositionCurrent.x - clusterRootPositionBefore.x,
                y: clusterRootPositionCurrent.y - clusterRootPositionBefore.y
            };
            const edgesInCluster = algorithmConversionConstraint.data.clusterifyConstraint.data.clusters[clusterRoot];
            for(const edgeInCluster of edgesInCluster) {
                const edgeInCurrentGraph = graph.findEdgeInAllEdges(edgeInCluster.id);
                const layoutedEdge = visualEdgesWithWaypoints.find(e => e.identifier === edgeInCluster.id);
                for (const waypoint of layoutedEdge.waypoints) {
                    waypoint.x += positionShift.x;
                    waypoint.y += positionShift.y;
                }

                edgeInCurrentGraph.visualEdge.visualEdge = layoutedEdge;
            }
        }

        return Promise.resolve(graph);
    },
    RESET_LAYOUT: function (_algorithmConversionConstraint: DefaultGraphConversionConstraint, graph: MainGraph): Promise<MainGraph> {
        graph.mainGraph.resetForNewLayout();
        return Promise.resolve(graph);
    }
}
