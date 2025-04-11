import { Direction } from "../util/utils";
import _ from "lodash";
import { ElkForceAlgType, ElkForceConfiguration, ElkLayeredConfiguration, ElkRadialConfiguration, ElkSporeOverlapConfiguration, ElkStressAdvancedUsingClustersConfiguration, ElkStressConfiguration, ElkStressProfileLayoutConfiguration } from "./elk/elk-constraints";
import { Edge } from "../graph/representation/edge";
import { AlgorithmName } from "../layout-algorithms/list-of-layout-algorithms";
import { isUserGivenAlgorithmConfigurationStressWithClusters, UserGivenAlgorithmConfigurationBase } from "./user-algorithm-configurations";

export type AffectedNodesGroupingsType = "ALL" | "GENERALIZATION";

export type EdgeRouting = "ORTHOGONAL" | "SPLINES" | "POLYLINE";

// We use 2 types of settings:
//     1) Configuration is the stuff strictly related to the algorithms - classic fields - min distance between nodes, some other parameters
//         Configuration internally uses constraint, we can just keep stacking objects - we don't do that though we would need some "+"" button in
//         dialog and that is too complicated, so the configurations being array is slight overkill


//     2) Constraints on the other hand can be related to algorithms (For example the anchoring), but can enforce some additional constraints on the nodes
//        Constraint is something very general it just has type, affected nodes and data, therefore configuration extends Constraint
//        Constraints are usually some graph transformation, which is used by layouting algorithm. - For example clusterify, or extra node manipulation, for example
//        For example some nodes should be aligned, some other relations between nodes, it can be basically anything
//                - For example some nodes should be aligned, some other relations between nodes, it can be basically anything


// There were 2 possibilities of how to represent the config from dialog as a type:
// 1) Flat structure
// 2) Hierarchy structure
// At first we chose the flat structure for the reason mentioned above (in the deprecated section),
// in the end we went for hierarchical. Why we chose the flat at first:
    // (well not completely flat, we have generalization and whole model),
    // because even though some of the info is specific only for some of the algorithms, a lot of it is shared
    // and the idea is that class representing the main algorithm gets the user configuration from dialog and it is its responsibility to
    // take only the relevant data and convert it to the implementation (based on used library) specific data
// But me moved to the hierarchic structure for 3 reasons:
// a) We can then just iterate through the fields and process them - 1 field 1 constraint
// b) It makes it easier to extend
// c) We can have uniformity, before that we had to have for the general variant the same fields as for layered algorithm in main
//    but prefixed with general_ - for example "general_layer_gap" (On a side note - Now we allow the generalization edges to be separately processed by any algorithm)
// We pay fot it though, when using setState with nested object it gets more complicated than with flat object



// TODO: Maybe can think of more specific name
export interface MemoryAllocationControl {
    shouldCreateNewGraph: boolean,
}

// TODO: Probably move somewhere else in code, since it is the converted constraint not the one given from configuration
export interface GraphConversionConstraint extends MemoryAllocationControl {
    actionName: SpecificGraphConversions,
    data: object,
    affectedNodes: AffectedNodesGroupingsType | string[],       // Either grouping or list of individual nodes
}


export type SpecificGraphConversions = "CREATE_GENERALIZATION_SUBGRAPHS" | "TREEIFY" | "CLUSTERIFY" | "LAYOUT_CLUSTERS_ACTION" | "RESET_LAYOUT";

export class DefaultGraphConversionConstraint implements GraphConversionConstraint {
    static createSpecificAlgorithmConversionConstraint(
        name: SpecificGraphConversions,
        userGivenAlgorithmConfiguration: UserGivenAlgorithmConfigurationBase | null,
    ): DefaultGraphConversionConstraint {
        switch(name) {
            case "CREATE_GENERALIZATION_SUBGRAPHS":
                return new DefaultGraphConversionConstraint(name, {}, "ALL", false);
            case "TREEIFY":
                return new DefaultGraphConversionConstraint(name, {}, "ALL", false);
            case "CLUSTERIFY":
                return new ClusterifyConstraint(name, {clusters: null}, "ALL", false);
            case "LAYOUT_CLUSTERS_ACTION":
                if(!isUserGivenAlgorithmConfigurationStressWithClusters(userGivenAlgorithmConfiguration)) {
                    console.error("Using actions for clusters but not using cluster layouting algorithm");
                    return;
                }
                const layoutClustersActionData = {
                    clusterifyConstraint: null,
                    edgeLength: userGivenAlgorithmConfiguration.stress_edge_len
                };
                return new LayoutClustersActionConstraint(name, layoutClustersActionData, "ALL", false);
            case "RESET_LAYOUT":
                return new DefaultGraphConversionConstraint(name, {}, "ALL", false);
            default:
                throw new Error("Forgot to extend createSpecificAlgorithmConversionConstraint for new conversion")
        }
    }


    constructor(
        actionName: SpecificGraphConversions,
        data: object,
        affectedNodes: AffectedNodesGroupingsType | string[],
        shouldCreateNewGraph: boolean
    ) {
        this.actionName = actionName;
        this.data = data;
        this.affectedNodes = affectedNodes;
        this.shouldCreateNewGraph = shouldCreateNewGraph;
    }

    actionName: SpecificGraphConversions;
    data: object;
    affectedNodes: AffectedNodesGroupingsType | string[];
    shouldCreateNewGraph: boolean;
}

export class ClusterifyConstraint extends DefaultGraphConversionConstraint {
    data: Record<"clusters", Record<string, Edge[]> | null> = { clusters: null };
}

export class LayoutClustersActionConstraint extends DefaultGraphConversionConstraint {
    constructor(
        actionName: SpecificGraphConversions,
        data: LayoutClustersActionConstraintDataType,
        affectedNodes: AffectedNodesGroupingsType | string[],
        shouldCreateNewGraph: boolean
    ) {
        super(actionName, data, affectedNodes, shouldCreateNewGraph);
        this.data = data;
    }

    data: LayoutClustersActionConstraintDataType = {
        "clusterifyConstraint": null,
        "edgeLength": 800
    };
}

type LayoutClustersActionConstraintDataType = {
    "clusterifyConstraint": ClusterifyConstraint | null,
    "edgeLength": number
};
