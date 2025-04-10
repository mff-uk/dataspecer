import { Direction } from "../util/utils";
import _ from "lodash";
import { ElkForceAlgType, ElkForceConfiguration, ElkLayeredConfiguration, ElkRadialConfiguration, ElkSporeOverlapConfiguration, ElkStressAdvancedUsingClustersConfiguration, ElkStressConfiguration, ElkStressProfileLayoutConfiguration } from "./elk/elk-constraints";
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



/**
 *
 * @returns Returns the configurations of the full thing, that is not only the algorithm configurations, but also the chosen algorithm.
 */
export function getDefaultUserGivenAlgorithmConfigurationsFull(): UserGivenAlgorithmConfigurations {
    return {
        main: getDefaultUserGivenAlgorithmConfigurationsMap(),
        general: getDefaultUserGivenAlgorithmConfigurationsMap(),
        chosenMainAlgorithm: "elk_layered",
        chosenGeneralAlgorithm: "none",
        additionalSteps: {}
    };
}

type ConfigMapFromUnion<T extends { layout_alg: string }> = {
    [K in T['layout_alg']]: Extract<T, { layout_alg: K }>;
};

type UserGivenAlgorithmConfigurationsMap = ConfigMapFromUnion<UserGivenAlgorithmConfigurationInterfaces>;

/**
 *
 * @returns Returns the configurations of the algorithms - and only algorithms
 */
function getDefaultUserGivenAlgorithmConfigurationsMap(): UserGivenAlgorithmConfigurationsMap {
    return {
        none: {
            layout_alg: "none",
            advanced_settings: undefined,
            run_layered_after: false,
            run_node_overlap_removal_after: false,
            interactive: false
        },
        elk_stress: ElkStressConfiguration.getDefaultConfiguration(),
        elk_layered: ElkLayeredConfiguration.getDefaultConfiguration(),
        elk_force: ElkForceConfiguration.getDefaultConfiguration(),
        random: RandomConfiguration.getDefaultConfiguration(),
        elk_radial: ElkRadialConfiguration.getDefaultConfiguration(),
        elk_overlapRemoval: ElkSporeOverlapConfiguration.getDefaultConfiguration(),
        elk_stress_advanced_using_clusters: ElkStressAdvancedUsingClustersConfiguration.getDefaultConfiguration(),
        elk_stress_profile: ElkStressProfileLayoutConfiguration.getDefaultConfiguration(),
        automatic: AutomaticConfiguration.getDefaultConfiguration()
    }
};


export interface UserGivenAlgorithmConfigurationsForModel {
    main: Partial<Record<AlgorithmName, UserGivenAlgorithmConfigurationBase>>,
    chosenMainAlgorithm: AlgorithmName,

    general: {"elk_layered": UserGivenAlgorithmConfigurationBase},
    chosenGeneralAlgorithm: AlgorithmName,
    additionalSteps: Record<number, (UserGivenAlgorithmConfigurations | GraphConversionConstraint)>,
}


export interface UserGivenAlgorithmConfigurations {
    main: UserGivenAlgorithmConfigurationsMap,
    chosenMainAlgorithm: AlgorithmName,

    general: UserGivenAlgorithmConfigurationsMap,
    chosenGeneralAlgorithm: AlgorithmName,
    additionalSteps: Record<number, (UserGivenAlgorithmConfigurations | GraphConversionConstraint)>,
}


export type EdgeRouting = "ORTHOGONAL" | "SPLINES" | "POLYLINE";


// TODO RadStr: Put all of this into separate file, but only after since there again might be some cycle-dependnecy
export type UserGivenAlgorithmConfigurationInterfaces =
    | UserGivenAlgorithmConfigurationLayered
    | UserGivenAlgorithmConfigurationStress
    | UserGivenAlgorithmConfigurationStressProfile
    | UserGivenAlgorithmConfigurationStressWithClusters
    | UserGivenAlgorithmConfigurationAutomatic
    | UserGivenAlgorithmConfigurationRadial
    | UserGivenAlgorithmConfigurationOverlapRemoval
    | UserGivenAlgorithmConfigurationNone
    | UserGivenAlgorithmConfigurationElkForce
    | UserGivenAlgorithmConfigurationRandom;

export type UserGivenAlgorithmConfigurationInterfacesUnion =
    & UserGivenAlgorithmConfigurationLayered
    & UserGivenAlgorithmConfigurationStress
    & UserGivenAlgorithmConfigurationStressProfile
    & UserGivenAlgorithmConfigurationStressWithClusters
    & UserGivenAlgorithmConfigurationAutomatic
    & UserGivenAlgorithmConfigurationRadial
    & UserGivenAlgorithmConfigurationOverlapRemoval
    & UserGivenAlgorithmConfigurationNone
    & UserGivenAlgorithmConfigurationElkForce
    & UserGivenAlgorithmConfigurationRandom;

export function isUserGivenAlgorithmConfigurationInterface(
    what: UserGivenAlgorithmConfigurationBase | undefined | null
): what is UserGivenAlgorithmConfigurationInterfaces {
    if(what === undefined || what === null || what?.layout_alg === undefined) {
        return false;
    }

    switch (what.layout_alg) {
        case "elk_layered":
        case "elk_stress":
        case "elk_stress_profile":
        case "elk_stress_advanced_using_clusters":
        case "automatic":
        case "elk_radial":
        case "elk_overlapRemoval":
        case "none":
        case "elk_force":
        case "random":
            return true;
        default:
            throw new Error(`Unknown layout_alg: ${(what as any).layout_alg}`);
    }
}

export interface UserGivenAlgorithmConfigurationLayered extends UserGivenAlgorithmConfigurationBase {
    layout_alg: "elk_layered",
    "alg_direction": Direction,
    "layer_gap": number,
    "in_layer_gap": number,
    "edge_routing": EdgeRouting
}
export function isUserGivenAlgorithmConfigurationLayered(
    what: UserGivenAlgorithmConfigurationBase | undefined | null
): what is UserGivenAlgorithmConfigurationLayered {
    return what?.layout_alg === "elk_layered";
}

interface UserGivenAlgorithmConfigurationStressBase extends UserGivenAlgorithmConfigurationBase {
    "stress_edge_len": number,
    "number_of_new_algorithm_runs": number,
}

export interface UserGivenAlgorithmConfigurationStress extends UserGivenAlgorithmConfigurationStressBase {
    layout_alg: "elk_stress",
    "stress_edge_len": number,
}
export function isUserGivenAlgorithmConfigurationStress(
    what: UserGivenAlgorithmConfigurationBase | undefined | null
): what is UserGivenAlgorithmConfigurationStress {
    return what?.layout_alg === "elk_stress";
}

export interface UserGivenAlgorithmConfigurationStressProfile extends UserGivenAlgorithmConfigurationStressBase {
    layout_alg: "elk_stress_profile",
    profileEdgeLength: number,
    preferredProfileDirection: Direction,
}
export function isUserGivenAlgorithmConfigurationStressProfile(
    what: UserGivenAlgorithmConfigurationBase | undefined | null
): what is UserGivenAlgorithmConfigurationStressProfile {
    return what?.layout_alg === "elk_stress_profile";
}

export interface UserGivenAlgorithmConfigurationStressWithClusters extends UserGivenAlgorithmConfigurationStressBase {
    layout_alg: "elk_stress_advanced_using_clusters",
}
export function isUserGivenAlgorithmConfigurationStressWithClusters(
    what: UserGivenAlgorithmConfigurationBase
): what is UserGivenAlgorithmConfigurationStressWithClusters {
    return what.layout_alg === "elk_stress_advanced_using_clusters";
}

export interface UserGivenAlgorithmConfigurationAutomatic extends UserGivenAlgorithmConfigurationBase {
    layout_alg: "automatic",
    "min_distance_between_nodes": number,
    number_of_new_algorithm_runs: number,
}
export function isUserGivenAlgorithmConfigurationAutomatic(
    what: UserGivenAlgorithmConfigurationBase | undefined | null
): what is UserGivenAlgorithmConfigurationAutomatic {
    return what?.layout_alg === "automatic";
}

export interface UserGivenAlgorithmConfigurationRadial extends UserGivenAlgorithmConfigurationBase {
    layout_alg: "elk_radial",
    "min_distance_between_nodes": number,
}
export function isUserGivenAlgorithmConfigurationRadial(
    what: UserGivenAlgorithmConfigurationBase | undefined | null
): what is UserGivenAlgorithmConfigurationRadial {
    return what?.layout_alg === "elk_radial";
}

export interface UserGivenAlgorithmConfigurationOverlapRemoval extends UserGivenAlgorithmConfigurationBase {
    layout_alg: "elk_overlapRemoval",
    "min_distance_between_nodes": number,
}
export function isUserGivenAlgorithmConfigurationOverlapRemoval(
    what: UserGivenAlgorithmConfigurationBase | undefined | null
): what is UserGivenAlgorithmConfigurationOverlapRemoval {
    return what?.layout_alg === "elk_overlapRemoval";
}

export interface UserGivenAlgorithmConfigurationNone extends UserGivenAlgorithmConfigurationBase {
    layout_alg: "none",
    "advanced_settings": {},

    "run_layered_after": false,
    "run_node_overlap_removal_after": false,
    "interactive": false,
}
export function isUserGivenAlgorithmConfigurationNone(
    what: UserGivenAlgorithmConfigurationBase | undefined | null
): what is UserGivenAlgorithmConfigurationNone {
    return what?.layout_alg === "none";
}

export interface UserGivenAlgorithmConfigurationElkForce extends UserGivenAlgorithmConfigurationBase {
    layout_alg: "elk_force",
    "min_distance_between_nodes": number,
    "force_alg_type": ElkForceAlgType,
    "number_of_new_algorithm_runs": number,
}
export function isUserGivenAlgorithmConfigurationElkForce(
    what: UserGivenAlgorithmConfigurationBase | undefined | null
): what is UserGivenAlgorithmConfigurationElkForce {
    return what?.layout_alg === "elk_force";
}

export interface UserGivenAlgorithmConfigurationRandom extends UserGivenAlgorithmConfigurationBase {
    layout_alg: "random",
}
export function isUserGivenAlgorithmConfigurationRandom(
    what: UserGivenAlgorithmConfigurationBase | undefined | null
): what is UserGivenAlgorithmConfigurationRandom {
    return what?.layout_alg === "random";
}

export interface UserGivenAlgorithmConfigurationExtraAlgorithmsToRunAfter {
    "run_layered_after": boolean,
    "run_node_overlap_removal_after": boolean,
}


export interface UserGivenAlgorithmConfigurationBase {
    "layout_alg": AlgorithmName,
    // The idea is to have fields which are "main" in a way and universal
    // (so they can be actually shared between algorithms ...
    //  which retrospectively doesn't add much, but still user can name the paramters as he pleases)
    // and then just advanced_settings, which contains additional configuration in the JSON format of given library
    // Note: the advanced_settings should override the main ones if passed, but it should not override the algorithm itself.
    //       (For example when I am calling elk.stress I can't just pass in elk.layered and run that instead,
    //        but I can change the desiredEdgeLength if I want to)
    "advanced_settings": Record<string, string>,

    "run_layered_after": boolean,
    "run_node_overlap_removal_after": boolean,
    "interactive": boolean,
}

/**
 * Constraint on predefined set of nodes.
 */
export interface Constraint<T extends UserGivenAlgorithmConfigurationBase> {
    affectedNodes: AffectedNodesGroupingsType,
    data: T,
}
export type AlgorithmPhases = "ONLY-PREPARE" | "ONLY-RUN" | "PREPARE-AND-RUN";

export interface AlgorithmOnlyConstraint<T extends UserGivenAlgorithmConfigurationBase> extends Constraint<T>, AdditionalControlOptions {
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

export interface AlgorithmConfiguration<T extends UserGivenAlgorithmConfigurationBase> extends AlgorithmOnlyConstraint<T>, AdvancedSettingsForUnderlying {
    addAdvancedSettings(advancedSettings: object): void;
    addAlgorithmConstraint(key: string, value: string): void;
}

export abstract class DefaultAlgorithmConfiguration<T extends UserGivenAlgorithmConfigurationBase> implements AlgorithmConfiguration<T> {
    algorithmName: AlgorithmName;           // Behaves as type guard!
    affectedNodes: AffectedNodesGroupingsType;
    data: T;
    type: string;
    name: string;
    shouldCreateNewGraph: boolean;
    algorithmPhasesToCall: AlgorithmPhases;

    constructor(
        givenAlgorithmConstraints: T,
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
        this.affectedNodes = affectedNodes;
        this.type = "ALG";
        this.data = givenAlgorithmConstraints;
    }
    abstract addAlgorithmConstraintForUnderlying(key: string, value: string): void;
    abstract addAdvancedSettingsForUnderlying(advancedSettings: object): void;

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

export class RandomConfiguration extends DefaultAlgorithmConfiguration<UserGivenAlgorithmConfigurationRandom> {
    static getDefaultConfiguration(): UserGivenAlgorithmConfigurationRandom {
        return {
            layout_alg: "random",
            advanced_settings: {},
            run_layered_after: false,
            run_node_overlap_removal_after: true,
            interactive: false
        }
    }

    constructor(
        givenAlgorithmConstraints: UserGivenAlgorithmConfigurationRandom,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(givenAlgorithmConstraints, affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.algorithmName = "random";
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
export abstract class StressConfiguration<T extends UserGivenAlgorithmConfigurationStressBase> extends DefaultAlgorithmConfiguration<T> {

    constructor(
        givenAlgorithmConstraints: T,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(givenAlgorithmConstraints, affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
    }

}


export abstract class LayeredConfiguration extends DefaultAlgorithmConfiguration<UserGivenAlgorithmConfigurationLayered> {
    constructor(
        givenAlgorithmConstraints: UserGivenAlgorithmConfigurationLayered,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(givenAlgorithmConstraints, affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
    }
}


// TODO: Maybe put each class to separate file?

// TODO: I am not sure if this actually adds anything - the extra abstract class before moving to the elk implementation


export abstract class RadialConfiguration extends DefaultAlgorithmConfiguration<UserGivenAlgorithmConfigurationRadial> {
    constructor(
        givenAlgorithmConstraints: UserGivenAlgorithmConfigurationRadial,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(givenAlgorithmConstraints, affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
    }
}


export class AutomaticConfiguration extends DefaultAlgorithmConfiguration<UserGivenAlgorithmConfigurationAutomatic> {
    static getDefaultConfiguration(): UserGivenAlgorithmConfigurationAutomatic {
        return {
            layout_alg: "automatic",
            min_distance_between_nodes: 500,
            number_of_new_algorithm_runs: 1,
            advanced_settings: {},
            run_layered_after: false,
            run_node_overlap_removal_after: false,
            interactive: false
        };
    }
    addAlgorithmConstraintForUnderlying(key: string, value: string): void {
        // Do Nothing
    }
    addAdvancedSettingsForUnderlying(advancedSettings: object): void {
        // Do nothing
    }

    constructor(
        givenAlgorithmConstraints: UserGivenAlgorithmConfigurationAutomatic,
        affectedNodes: AffectedNodesGroupingsType,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(givenAlgorithmConstraints, affectedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.algorithmName = "automatic";
    }
}
