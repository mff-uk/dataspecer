import { Direction } from "../util/utils";
import _ from "lodash";
import { ElkForceAlgType } from "./elk/elk-constraints";
import { Edge } from "../graph/representation/edge";
import { AlgorithmName } from "../layout-algorithms/list-of-layout-algorithms";

export type AffectedNodesGroupingsType = "ALL" | "GENERALIZATION";


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
interface AdditionalControlOptions {
    shouldCreateNewGraph: boolean,
}

// TODO: Probably move somewhere else in code, since it is the converted constraint not the one given from configuration
export interface GraphConversionConstraint extends AdditionalControlOptions {
    actionName: SpecificGraphConversions,
    data: object,
    affectedNodes: AffectedNodesGroupingsType | string[],       // Either grouping or list of individual nodes
}


export type SpecificGraphConversions = "CREATE_GENERALIZATION_SUBGRAPHS" | "TREEIFY" | "CLUSTERIFY" | "LAYOUT_CLUSTERS_ACTION" | "RESET_LAYOUT";

export class DefaultGraphConversionConstraint implements GraphConversionConstraint {
    static createSpecificAlgorithmConversionConstraint(
        name: SpecificGraphConversions,
        userGivenAlgorithmConfiguration: UserGivenAlgorithmConfiguration | null,
    ): DefaultGraphConversionConstraint {
        switch(name) {
            case "CREATE_GENERALIZATION_SUBGRAPHS":
                return new DefaultGraphConversionConstraint(name, {}, "ALL", false);
            case "TREEIFY":
                return new DefaultGraphConversionConstraint(name, {}, "ALL", false);
            case "CLUSTERIFY":
                return new ClusterifyConstraint(name, {clusters: null}, "ALL", false);
            case "LAYOUT_CLUSTERS_ACTION":
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

// TODO RadStr REFACTOR:
export function getDefaultUserGivenConstraintsVersion4(): UserGivenAlgorithmConfigurationslVersion4 {
    return {
        main: {
            "elk_layered": {
                ...getDefaultUserGivenAlgorithmConstraint("elk_layered"),
            }
        },
        general: {
            "elk_layered": {
                ...getDefaultUserGivenAlgorithmConstraint("elk_layered"),
                "layout_alg": "elk_layered",        // Defined as stress in the default
            }
        },
        chosenMainAlgorithm: "elk_layered",
        chosenGeneralAlgorithm: "none",
        additionalSteps: {}
    };
}


export interface UserGivenAlgorithmConfigurationslVersion4 {
    main: Partial<Record<AlgorithmName, UserGivenAlgorithmConfiguration>>,
    chosenMainAlgorithm: AlgorithmName,

    general: {"elk_layered": UserGivenAlgorithmConfiguration},
    chosenGeneralAlgorithm: AlgorithmName,
    additionalSteps: Record<number, (UserGivenAlgorithmConfigurationslVersion4 | GraphConversionConstraint)>,
}


// TODO RadStr: Actually it might be better from programming perspective to have main: [algorithmName]: SpecificConfiguration, chosenAlgorithm: AlgorithmName !!!!
export function getDefaultUserGivenConstraintsVersion5(): UserGivenAlgorithmConfigurationslVersion5 {
    return {
        main:
        {
            configuration: {
                "elk_layered": {
                    ...getDefaultUserGivenAlgorithmConstraint("elk_layered"),
                }
            },
            chosenAlgorithm: "elk_layered",
        },
        generalization:
        {
            configuration: {
                "elk_layered": {
                    ...getDefaultUserGivenAlgorithmConstraint("elk_layered"),
                }
            },
            chosenAlgorithm: "none",
        }
    };
}

export interface UserGivenAlgorithmConfigurationslVersion5 {
    main: {
        configuration: Partial<Record<AlgorithmName, UserGivenAlgorithmConfiguration>>
        chosenAlgorithm: AlgorithmName,
    },
    generalization: {
        configuration: Partial<Record<AlgorithmName, UserGivenAlgorithmConfiguration>>
        chosenAlgorithm: AlgorithmName,
    },
}



export type EdgeRouting = "ORTHOGONAL" | "SPLINES" | "POLYLINE";

export interface UserGivenAlgorithmConfigurationLayered {
    "alg_direction": Direction,
    "layer_gap": number,
    "in_layer_gap": number,
    "edge_routing": EdgeRouting
}

export interface UserGivenAlgorithmConfigurationStress {
    "stress_edge_len": number,
    "number_of_new_algorithm_runs": number,
}

export interface UserGivenAlgorithmConfigurationStressProfile extends UserGivenAlgorithmConfigurationStress {
    profileEdgeLength: number,
    preferredProfileDirection: Direction,
}

export interface UserGivenAlgorithmConfigurationSpore {
    "min_distance_between_nodes": number,
}

export interface UserGivenAlgorithmConfigurationElkForce {
    "min_distance_between_nodes": number,
    "force_alg_type": ElkForceAlgType,
    "number_of_new_algorithm_runs": number,
}

export interface UserGivenAlgorithmConfigurationExtraAlgorithmsToRunAfter {
    "run_layered_after": boolean,
    "run_node_overlap_removal_after": boolean,
}

// This actually only used so we type checking for the mapping from the universal parameter names to the library ones (for example to the elk ones)
export interface UserGivenAlgorithmConfigurationOnlyData extends UserGivenAlgorithmConfigurationLayered,
                                                                UserGivenAlgorithmConfigurationStressProfile,
                                                                UserGivenAlgorithmConfigurationElkForce {
    "layout_alg": AlgorithmName,        // Now it is actually redundant, but it is still to better to keep it here (rewriting takes too much work)
    // The idea is to have fields which are "main" in a way and universal (so they can be actually shared between algorithms) and then just advanced_settings
    // which contains additional configuration in the JSON format of given library
    // Note: the advanced_settings should override the main ones if passed, but it should not override the algorithm itself.
    //       (For example when I am calling elk.stress I can't just pass in elk.layered and run that instead,
    //        but I can change the desiredEdgeLength if I want to)
    "interactive": boolean,
    "advanced_settings": Record<string, string>,
}

export interface UserGivenAlgorithmConfiguration extends UserGivenAlgorithmConfigurationOnlyData, UserGivenAlgorithmConfigurationExtraAlgorithmsToRunAfter { }

// TODO: getDefaultUserGivenAlgorithmConfiguration
export function getDefaultUserGivenAlgorithmConstraint(algorithmName: AlgorithmName): UserGivenAlgorithmConfiguration {
    let interactive = false;
    let run_node_overlap_removal_after = false;
    // TODO RadStr: Spore compaction seems to be useless (it is like layered algorithm)
    if(algorithmName === "elk_overlapRemoval" || algorithmName === "sporeCompaction" || algorithmName === "elk_stress_advanced_using_clusters") {
        interactive = true;
    }
    if(algorithmName === "elk_stress" || algorithmName === "elk_stress_advanced_using_clusters" ||
       algorithmName === "random") {
        run_node_overlap_removal_after = true;
    }
    return {
        "layout_alg": algorithmName,
    //  "profile-nodes-position-against-source": DIRECTION.Down,
        ...LayeredConfiguration.getDefaultObject(),
        "stress_edge_len": 800,
        profileEdgeLength: 800,
        run_node_overlap_removal_after,
        preferredProfileDirection: Direction.Up,

        "force_alg_type": "FRUCHTERMAN_REINGOLD",
        "min_distance_between_nodes": 100,
        "number_of_new_algorithm_runs": 10,
        "run_layered_after": false,
        interactive,
        advanced_settings: {},
    }
}

export function getDefaultMainUserGivenAlgorithmConstraint(algorithmName: AlgorithmName): UserGivenAlgorithmConfiguration {
    return {
        ...getDefaultUserGivenAlgorithmConstraint(algorithmName),
    };
}

/**
 * Constraint on predefined set of nodes.
 */
export interface Constraint {
    name: string;
    type: string;
    affectedNodes: AffectedNodesGroupingsType,
    data: object,
}
export type AlgorithmPhases = "ONLY-PREPARE" | "ONLY-RUN" | "PREPARE-AND-RUN";

export interface AlgorithmOnlyConstraint extends Constraint, AdditionalControlOptions {
    algorithmName: AlgorithmName;
    /**
     * Default is "PREPARE-AND-RUN", other values need to be explicitly set in constructor -
     * You should set it to other value only in case if you know that algorithm can be prepared once and then run multiple times.
     * - For example force algorithm needs to be prepared only once before going into the main loop where it is iteratively called with different seeds
     */
    algorithmPhasesToCall: AlgorithmPhases;
}

interface AdvancedSettingsForUnderlying {
    addAdvancedSettingsForUnderlying(advancedSettings: object): void;
    addAlgorithmConstraintForUnderlying(key: string, value: string): void;
}

export interface AlgorithmConfiguration extends AlgorithmOnlyConstraint, AdvancedSettingsForUnderlying {
    addAdvancedSettings(advancedSettings: object): void;
    addAlgorithmConstraint(key: string, value: string): void;
}

export abstract class DefaultAlgorithmConfiguration implements AlgorithmConfiguration {
    algorithmName: AlgorithmName;
    affectedNodes: AffectedNodesGroupingsType;
    data: object;
    type: string;
    name: string;
    shouldCreateNewGraph: boolean;
    algorithmPhasesToCall: AlgorithmPhases;

    /**
     *
     * @returns the keys/names (in the general sense, not in the library specific sense), which are relevant for given algorithm. new keys are added in children classes.
     */
    getAllRelevantConstraintKeys() {
        let constraintKeys = [
            "layout_alg",
            "interactive",
        ];


        return constraintKeys;
    }

    constructor(
        algorithmName: AlgorithmName,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        if(algorithmPhasesToCall === undefined) {
            this.algorithmPhasesToCall = "PREPARE-AND-RUN";
        }
        else {
            this.algorithmPhasesToCall = algorithmPhasesToCall;
        }
        this.shouldCreateNewGraph = shouldCreateNewGraph;
        this.algorithmName = algorithmName;
        this.affectedNodes = affectedNodes;
        this.type = "ALG";
    }
    abstract addAlgorithmConstraintForUnderlying(key: string, value: string): void;
    abstract addAdvancedSettingsForUnderlying(advancedSettings: object): void;

    /**
     * Picks relevant keys from {@link getAllRelevantConstraintKeys} and uses those keys to get values from {@link givenAlgorithmConstraints}, then sets {@link data} based on that.
     */
    setData(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration) {
        this.data = _.pick(givenAlgorithmConstraints, this.getAllRelevantConstraintKeys());
        this.data["advanced_settings"] = givenAlgorithmConstraints.advanced_settings;
    }

    addAlgorithmConstraint(key: string, value: string): void {
        this.data[key] = value;
        this.addAlgorithmConstraintForUnderlying(key, value);
    }

    public addAdvancedSettings(advancedSettings: object) {
        if(this.data["advanced_settings"] === undefined) {
            this.data["advanced_settings"] = {...advancedSettings};
        }
        else {
            this.data["advanced_settings"] = {
                ...this.data["advanced_settings"],
                ...advancedSettings,
            };
        }

        this.addAdvancedSettingsForUnderlying(advancedSettings);
    }
}

export class RandomConfiguration extends DefaultAlgorithmConfiguration {
    constructor(affectedNodes: AffectedNodesGroupingsType, shouldCreateNewGraph: boolean, algorithmPhasesToCall?: AlgorithmPhases) {
        super("random", affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
    }

    addAlgorithmConstraintForUnderlying(key: string, value: string): void {
        // EMPTY
    }
    addAdvancedSettingsForUnderlying(advancedSettings: object): void {
        // EMPTY
    }

}

// TODO RadStr: I can return default object in the same way as for LayeredConfiguration.
/**
 * General Class which has all relevant constraints for the stress like algorithm. The classes extending this should convert the constraints into
 * the representation which will be used in the algorithm (that means renaming, transforming[, etc.] the parameters in the data field)
 */
export abstract class StressConfiguration extends DefaultAlgorithmConfiguration {
    getAllRelevantConstraintKeys(): string[] {
        return super.getAllRelevantConstraintKeys().concat([
            "stress_edge_len",
        ]);
    }

    constructor(
        algorithmName: AlgorithmName,
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(algorithmName, affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.setData(givenAlgorithmConstraints);
    }

    data: UserGivenAlgorithmConfigurationStress = undefined;
}


export abstract class LayeredConfiguration extends DefaultAlgorithmConfiguration {
    getAllRelevantConstraintKeys(): string[] {
        return super.getAllRelevantConstraintKeys().concat(Object.keys(LayeredConfiguration.getDefaultObject()));
    }

    // TODO: Ideally just export this static function not the whole class, but it seems that it is possible only using aliasing
    static getDefaultObject(): UserGivenAlgorithmConfigurationLayered {
        return {
            "alg_direction": Direction.Up,
            "layer_gap": 500,
            "in_layer_gap": 500,
            "edge_routing": "ORTHOGONAL",
        }
    }
    constructor(
        algorithmName: AlgorithmName,
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(algorithmName, affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.setData(givenAlgorithmConstraints);
    }

    data: UserGivenAlgorithmConfigurationLayered = undefined;
}


// TODO: Maybe put each class to separate file?
export abstract class SporeConfiguration extends DefaultAlgorithmConfiguration {
    getAllRelevantConstraintKeys(): string[] {
        return super.getAllRelevantConstraintKeys().concat([
            "min_distance_between_nodes",
        ]);
    }

    constructor(
        algorithmName: AlgorithmName,
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(algorithmName, affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.setData(givenAlgorithmConstraints);
    }

    data: UserGivenAlgorithmConfigurationSpore = undefined
}



export abstract class RadialConfiguration extends DefaultAlgorithmConfiguration {
    getAllRelevantConstraintKeys(): string[] {
        return super.getAllRelevantConstraintKeys().concat([
            "min_distance_between_nodes",
        ]);
    }

    constructor(
        algorithmName: AlgorithmName,
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(algorithmName, affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.setData(givenAlgorithmConstraints);
    }

    data: UserGivenAlgorithmConfigurationSpore = undefined
}


export class AutomaticConfiguration extends DefaultAlgorithmConfiguration {
    addAlgorithmConstraintForUnderlying(key: string, value: string): void {
        // Do Nothing
    }
    addAdvancedSettingsForUnderlying(advancedSettings: object): void {
        // Do nothing
    }
    getAllRelevantConstraintKeys(): string[] {
        return super.getAllRelevantConstraintKeys().concat([
            "min_distance_between_nodes",
        ]);
    }

    constructor(
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(givenAlgorithmConstraints.layout_alg, affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.setData(givenAlgorithmConstraints);
    }

    data: Record<"min_distance_between_nodes", number> = undefined;
}
