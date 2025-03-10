import { IEdgeClassic, IGraphClassic, IMainGraphClassic } from "../graph-iface"
import { Direction } from "../util/utils";
import { ALGORITHM_NAME_TO_LAYOUT_MAPPING, AlgorithmName } from "./constraint-container";
import _ from "lodash";
import { ElkForceAlgType } from "./elk/elk-constraints";
import { NodeDimensionQueryHandler, UserGivenConstraintsVersion2 } from "..";
import { compactify } from "./constraints-implementation";
import { GraphAlgorithms } from "../graph-algoritms";
import { ConstraintFactory } from "./constraint-factories";


export type ConstraintedNodesGroupingsType = "ALL" | "GENERALIZATION" | "PROFILE";


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Old part of already deprecated config
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// There were 2 possibilities of how to represent the config from dialog as a type:
// 1) Flat structure
// 2) Hierarchy structure
// We chose flat structure (well not completely flat, we have generalization and whole model),
// because even though some of the info is specific only for some of the algorithms, a lot of it is shared
// and the idea is that class representing the main algorithm gets the user configuration from dialog and it is its responsibility to
// take only the relevant data and convert it to the implementation (based on used library) specific data
/**
 * @deprecated
 */
export interface UserGivenConstraints extends BasicUserGivenConstraints, UserGivenConstraintsChangingCodeFlow {}

/**
 * @deprecated
 */
export interface UserGivenConstraintsChangingCodeFlow {
    "process_general_separately": boolean,
    "double_run": boolean,
}

/**
 * @deprecated
 */
export interface BasicUserGivenConstraints {
        "main_layout_alg": AlgorithmName,
// profile-nodes-position-against-source": DIRECTION.Down,
        "main_alg_direction": Direction,
        "layer_gap": number,
        "in_layer_gap": number,

        "stress_edge_len": number,

        "min_distance_between_nodes": number,
        "force_alg_type": ElkForceAlgType,

        "general_main_alg_direction": Direction,
        "general_layer_gap": number,
        "general_in_layer_gap": number,
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// End of old already deprecated part config
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// We use 2 types of settings:
//     1) Configuration is the stuff strictly related to the algorithms - classic fields - min distance between nodes, some other parameters
// TODO: !!! Configuration internally uses constraint - therefore the split to main/general is completely unnecesary, we can just keep stacking objects
//                            and the need to split is not needed, just the dialog needs to add the "should_be_considered": true, "constraintedNodes": "ALL"
//                            (respectively the should_be_considered can be deducted from the fact that it is inside the list of objects or not)
//                            ... this is much more general and better .... but will we use it??? only If I want to override the settings somehow for group of nodes
//                            ... Keep it "simple" for now, I can always rewrite it to create more objects than the main, general!!!!!
//                            ... It starts making sense only if you add some "+" button which adds constraints, otherwise enumeration is enough
//


//     2) Constraints on the other hand can be related to algorithms (For example the anchoring), but can enforce some additional constraints on the nodes
//        Constraint is something very general it just has type, affected nodes and data, therefore configuration extends Constraint
//                - For example some nodes should be aligned, some other relations between nodes, it can be basically anything
//                - TODO:
//                -       Well everything but it has to be implemented into the algorithms, so ideally it should contain the actual code which solves the constraint
//                -       Well really I can't think of anything really useful except the aligning
//                -       Maybe we could think about the constraints as some post-fix??? or "in-iteration-fix" - for example some articles about the constraints -
//                -       had 1 iteration of the physical layout model followed by the constraints - this is closer to the d3.js approach



// There were 2 possibilities of how to represent the config from dialog as a type:
// 1) Flat structure
// 2) Hierarchy structure
// At first we chose the flat structure for the reason mentioned above (in the deprecated section)
// But me moved to the hierarchic structure for 3 reasons:
// a) We can then just iterate through the fields and process them - 1 field 1 constraint
// b) It makes it easier to extend
// c) We can have uniformity, before that we had to have for the general variant the same fields as for layered algorithm in main
//    but prefixed with general_ - for example "general_layer_gap" (On a side note - Now we allow the generalization edges to be separately processed by any algorithm)
// We pay fot it though, when using setState with nested object it gets more complicated than with flat object
/**
 * @deprecated
 */
export interface UserGivenAlgorithmConfigurationslVersion2 {
    // The information after & can be safely deducted from the field name
    main: MainUserGivenAlgorithmConfiguration,
    general: UserGivenAlgorithmConfigurationForGeneralization,
    // TODO: if we want to later have run limit
    // maxTime: number,
    // fixModel: [{
    //     modelId: string
    // }]
}

// The information after & can be safely deducted from the field name in the actual object
// TODO: ... I need the should_be_considered field only for the generalization, otherwise not - so I will just take it out and put into the object, simliarly to the chosenAlgorithm
//       But what about future proofing? ... For now keep it, if I will see in few months that there is no use, just remove the field and and new field, simliarly to the chosenAlgorithm
type MainUserGivenAlgorithmConfiguration = UserGivenAlgorithmConfiguration & { "should_be_considered": true, "constraintedNodes": "ALL" };


// TODO: Maybe can think of more specific name
interface IAdditionalControlOptions {
    shouldCreateNewGraph: boolean,
}


/**
 * @deprecated
 */
interface IUserGivenAlgorithmConstraint {
    chosenAlgorithm: AlgorithmName,
    algorithmSettings: Partial<Record<AlgorithmName, UserGivenAlgorithmConfiguration>>,
    constraintedNodes: ConstraintedNodesGroupingsType | string[],       // Either grouping or list of individual nodes
}

// TODO: Probably move somewhere else in code, since it is the converted constraint not the one given from configuration
export interface IGraphConversionConstraint extends IAdditionalControlOptions {
    actionName: SpecificGraphConversions,
    data: object,
    constraintedNodes: ConstraintedNodesGroupingsType | string[],       // Either grouping or list of individual nodes
}

type SpecificGraphConversions = "CREATE_GENERALIZATION_SUBGRAPHS" | "TREEIFY" | "CLUSTERIFY" | "LAYOUT_CLUSTERS_ACTION";

export class GraphConversionConstraint implements IGraphConversionConstraint {
    static createSpecificAlgorithmConversionConstraint(name: SpecificGraphConversions): GraphConversionConstraint {
        switch(name) {
            case "CREATE_GENERALIZATION_SUBGRAPHS":
                return new GraphConversionConstraint(name, {}, "ALL", false);
            case "TREEIFY":
                return new GraphConversionConstraint(name, {}, "ALL", false);
            case "CLUSTERIFY":
                return new ClusterifyConstraint(name, {clusters: null}, "ALL", false);
            case "LAYOUT_CLUSTERS_ACTION":
                return new GraphConversionConstraint(name, {clusterifyConstraint: null}, "ALL", false);
        }
    }


    constructor(
        actionName: SpecificGraphConversions,
        data: object,
        constraintedNodes: ConstraintedNodesGroupingsType | string[],
        shouldCreateNewGraph: boolean
    ) {
        this.actionName = actionName;
        this.data = data;
        this.constraintedNodes = constraintedNodes;
        this.shouldCreateNewGraph = shouldCreateNewGraph;
    }

    actionName: SpecificGraphConversions;
    data: object;
    constraintedNodes: ConstraintedNodesGroupingsType | string[];
    shouldCreateNewGraph: boolean;
}

export class ClusterifyConstraint extends GraphConversionConstraint {
    data: Record<"clusters", IEdgeClassic[][] | null> = { clusters: null };
}

export class LayoutClustersActionConstraint extends GraphConversionConstraint {
    data: Record<"clusterifyConstraint", ClusterifyConstraint | null> = { clusterifyConstraint: null };
}

type SpecificGraphConversionMethod = (algorithmConversionConstraint: GraphConversionConstraint, graph: IMainGraphClassic) => Promise<IMainGraphClassic>;

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
        algorithmConversionConstraint.data.clusters = clusteredEdges
        return Promise.resolve(graph);
    },
    LAYOUT_CLUSTERS_ACTION: async (
        algorithmConversionConstraint: LayoutClustersActionConstraint,
        graph: IMainGraphClassic
    ): Promise<IMainGraphClassic> => {
        console.info("algorithmConversionConstraint.data.clusterifyConstraint.data.clusters", algorithmConversionConstraint.data.clusterifyConstraint.data.clusters);
        for(const node of graph.allNodes) {
            const isInCluster = algorithmConversionConstraint.data.clusterifyConstraint.data.clusters[0]
                .find(edge => edge.start.id === node.id || edge.end.id === node.id) !== undefined;
            if(isInCluster) {
                node.isConsideredInLayout = true;
            }
            else {
                node.isConsideredInLayout = false;
            }
        }
        const layeredAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING["elk_layered"];
        const configuration = getDefaultUserGivenConstraintsVersion4();
        const constraintContainer = ConstraintFactory.createConstraints(configuration);
        layeredAlgorithm.prepareFromGraph(graph, constraintContainer);
        return layeredAlgorithm.run(false);

        // TODO RadStr: Remove
        return graph;
        // for(const node of graph.allNodes) {
        //     node.completeVisualNode.coreVisualNode.position = {
        //         x: algorithmConversionConstraint.data.clusterifyConstraint.data.clusters[0][1].start.completeVisualNode.coreVisualNode.position.x,
        //         y: 100,
        //         anchored: null
        //     };
        // }
    }
}


/**
 * @deprecated
 */
export interface UserGivenAlgorithmConfigurationslVersion3 {
    steps: (IUserGivenAlgorithmConstraint | IGraphConversionConstraint)[],
}


/**
 * @deprecated
 */
export interface UserGivenAlgorithmConfigurationslVersion3 {
    steps: (IUserGivenAlgorithmConstraint | IGraphConversionConstraint)[],
}


/**
 * @deprecated
 */
export function getDefaultUserGivenConstraintsVersion3(): (IUserGivenAlgorithmConstraint | IGraphConversionConstraint)[] {
    return [
            GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("CREATE_GENERALIZATION_SUBGRAPHS"),
            {
                chosenAlgorithm: "elk_layered",
                algorithmSettings: {"elk_layered": {...getDefaultUserGivenAlgorithmConstraint("elk_layered"), constraintedNodes: "ALL", should_be_considered: false}},
                "constraintedNodes": "GENERALIZATION",
            },
            {
                chosenAlgorithm: "elk_layered",
                algorithmSettings: {"elk_layered": {...getDefaultUserGivenAlgorithmConstraint("elk_layered"), constraintedNodes: "ALL", should_be_considered: false}},
                "constraintedNodes": "ALL",
            },
    ];
}

export function getDefaultUserGivenConstraintsVersion4(): UserGivenAlgorithmConfigurationslVersion4 {
    return {
        main: {
            "elk_layered": {
                ...getDefaultUserGivenAlgorithmConstraint("elk_layered"),
                "should_be_considered": true,
                "constraintedNodes": "ALL",
            }
        },
        general: {
            "elk_layered": {
                ...getDefaultUserGivenAlgorithmConstraint("elk_layered"),
                "layout_alg": "elk_layered",        // Defined as stress in the default
                "should_be_considered": false,
                "constraintedNodes": "GENERALIZATION",
            }
        },
        chosenMainAlgorithm: "elk_layered",
        mainStepNumber: 1,
        generalStepNumber: 0,
        additionalSteps: {},
    };
}


function getDefaultAdditionalStepsForVersion4ExampleImplementation(): Record<number, (UserGivenAlgorithmConfiguration | IGraphConversionConstraint)> {
    return {
        0: GraphConversionConstraint.createSpecificAlgorithmConversionConstraint("CREATE_GENERALIZATION_SUBGRAPHS"),
        1: {
            ...getDefaultUserGivenAlgorithmConstraint("elk_layered"), constraintedNodes: "GENERALIZATION", should_be_considered: false,
        },
        2: {
            ...getDefaultUserGivenAlgorithmConstraint("elk_layered"), constraintedNodes: "ALL", should_be_considered: false,
        },
    }
}



export interface UserGivenAlgorithmConfigurationslVersion4 {
    main: Partial<Record<AlgorithmName, UserGivenAlgorithmConfiguration>>,
    chosenMainAlgorithm: AlgorithmName,

    general: {"elk_layered": UserGivenAlgorithmConfigurationForGeneralization},
    mainStepNumber: number,
    generalStepNumber: number,
    additionalSteps: Record<number, (UserGivenAlgorithmConfiguration | IGraphConversionConstraint)>,
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

export interface UserGivenAlgorithmConfigurationSpore {
    "min_distance_between_nodes": number,
}

export interface UserGivenAlgorithmConfigurationElkForce {
    "min_distance_between_nodes": number,
    "force_alg_type": ElkForceAlgType,
    "number_of_new_algorithm_runs": number,
}


export interface UserGivenAlgorithmConfigurationExtraData {
    "constraintedNodes": ConstraintedNodesGroupingsType,
    "should_be_considered": boolean,
    "run_layered_after": boolean
}

// This actually only used so we type checking for the mapping from the universal parameter names to the library ones (for example to the elk ones)
export interface UserGivenAlgorithmConfigurationOnlyData extends UserGivenAlgorithmConfigurationLayered,
                                                                UserGivenAlgorithmConfigurationStress,
                                                                UserGivenAlgorithmConfigurationElkForce {
    "layout_alg": AlgorithmName,        // Now it is actually redundant, but it is still to better to keep it here (rewriting takes too much work)
    // The idea is to have fields which are "main" in a way and universal (so they can be actually shared between algorithms) and then just advanced_settings
    // which contains additional configuration in the JSON format of given library
    // (Note: the advanced_settings should override the main one if passed - TODO: Rewrite so it is actually the case)
    "interactive": boolean,
    "advanced_settings": object,
}

export interface UserGivenAlgorithmConfiguration extends UserGivenAlgorithmConfigurationOnlyData, UserGivenAlgorithmConfigurationExtraData { }


export interface UserGivenAlgorithmConfigurationForGeneralization extends UserGivenAlgorithmConfiguration {
    "constraintedNodes": "GENERALIZATION"
}

export function getDefaultUserGivenConstraintsVersion2(): UserGivenConstraintsVersion2 {
    return {
        main: {
            ...getDefaultMainUserGivenAlgorithmConstraint("elk_stress"),
        },
        general: {
            ...getDefaultUserGivenAlgorithmConstraint("elk_stress"),
            "layout_alg": "elk_layered",        // Defined as stress in the default
            "should_be_considered": false,
            "constraintedNodes": "GENERALIZATION",
        }
    };
}

// TODO: getDefaultUserGivenAlgorithmConfiguration
export function getDefaultUserGivenAlgorithmConstraint(algorithmName: AlgorithmName): Omit<UserGivenAlgorithmConfiguration, "constraintedNodes" | "should_be_considered"> {
    let interactive = false;
    // TODO RadStr: Spore compaction seems to be useless (it is like layered algorithm)
    if(algorithmName === "elk_overlapRemoval" || algorithmName === "sporeCompaction" || algorithmName === "elk_stress_advanced_using_clusters") {
        interactive = true;
    }
    return {
        "layout_alg": algorithmName,
    //  "profile-nodes-position-against-source": DIRECTION.Down,
        ...LayeredConfiguration.getDefaultObject(),
        "stress_edge_len": 800,

        "force_alg_type": "FRUCHTERMAN_REINGOLD",
        "min_distance_between_nodes": 100,
        "number_of_new_algorithm_runs": 10,
        "run_layered_after": false,
        interactive,
        advanced_settings: {},
    }
}

export function getDefaultMainUserGivenAlgorithmConstraint(algorithmName: AlgorithmName): MainUserGivenAlgorithmConfiguration {
    return {
        ...getDefaultUserGivenAlgorithmConstraint(algorithmName),
        "should_be_considered": true,
        "constraintedNodes": "ALL",
    };
}

export type ConstraintTime = "PRE-MAIN" | "IN-MAIN" | "POST-MAIN";

interface IConstraintType {
    name: string;
    constraintTime: ConstraintTime;
    type: string;
}

/**
 * Constraint on concrete set of nodes.
 */
export interface IConstraint extends IConstraintType {
    constraintedSubgraph: IGraphClassic;
    data: object;
}

/**
 * Constraint to fix group of nodes in position
 */
export class FixPositionConstraint implements IConstraint {
    constraintedSubgraph: IGraphClassic;
    data: undefined = undefined;
    name = "Anchor constraint";
    type = "ANCHOR";
    constraintTime: ConstraintTime = "PRE-MAIN";
}

/**
 * Constraint on predefined set of nodes.
 */
export interface IConstraintSimple extends IConstraintType {
    constraintedNodes: ConstraintedNodesGroupingsType,
    // TODO: modelID is part of data in case constaintedNodes === "MODEL", maybe just create interface IConstraintSimpleForModel, which extends this one
    //       which has modelID field
    data: object,
}

// TODO: Check IConstraintSimple for more info on modelID
// export interface IConstraintSimpleForModel extends IConstraintSimple {
//     constraintedNodes: "MODEL",
//     // modelID: string,
//     data: object,
// }

export type AlgorithmPhases = "ONLY-PREPARE" | "ONLY-RUN" | "PREPARE-AND-RUN";

export interface IAlgorithmOnlyConstraint extends IConstraintSimple, IAdditionalControlOptions {
    algorithmName: AlgorithmName;
    /**
     * Default is "PREPARE-AND-RUN", other values need to be explicitly set in constructor -
     * You should set it to other value only in case if you know that algorithm can be prepared once and then run multiple times.
     * - For example force algorithm needs to be prepared only once before going into the main loop where it is iteratively called with different seeds
     */
    algorithmPhasesToCall: AlgorithmPhases;
    // modelID: string | null;        // TODO: Is null in case it is meant for whole algorithm, model if for model
}

interface IAdvancedSettingsForUnderlying {
    addAdvancedSettingsForUnderlying(advancedSettings: object): void;
    addAlgorithmConstraintForUnderlying(key: string, value: string): void;
}

export interface IAlgorithmConfiguration extends IAlgorithmOnlyConstraint, IAdvancedSettingsForUnderlying {
    addAdvancedSettings(advancedSettings: object): void;
    addAlgorithmConstraint(key: string, value: string): void;
}

export abstract class AlgorithmConfiguration implements IAlgorithmConfiguration {
    algorithmName: AlgorithmName;
    constraintedNodes: ConstraintedNodesGroupingsType;
    data: object;
    type: string;
    name: string;
    constraintTime: ConstraintTime = "IN-MAIN";
    shouldCreateNewGraph: boolean;
    // modelID: string = undefined;        // TODO: For now just undefined no matter what, I am still not sure how will it work with models
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

    constructor(algorithmName: AlgorithmName, constrainedNodes: ConstraintedNodesGroupingsType, shouldCreateNewGraph: boolean, algorithmPhasesToCall?: AlgorithmPhases) {
        if(algorithmPhasesToCall === undefined) {
            this.algorithmPhasesToCall = "PREPARE-AND-RUN";
        }
        else {
            this.algorithmPhasesToCall = algorithmPhasesToCall;
        }
        this.shouldCreateNewGraph = shouldCreateNewGraph;
        this.algorithmName = algorithmName;
        this.constraintedNodes = constrainedNodes;
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

export class RandomConfiguration extends AlgorithmConfiguration {
    constructor(constrainedNodes: ConstraintedNodesGroupingsType, shouldCreateNewGraph: boolean, algorithmPhasesToCall?: AlgorithmPhases) {
        super("random", constrainedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
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
export abstract class StressConfiguration extends AlgorithmConfiguration {
    getAllRelevantConstraintKeys(): string[] {
        return super.getAllRelevantConstraintKeys().concat([
            "stress_edge_len",
        ]);
    }

    constructor(
        algorithmName: AlgorithmName,
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(algorithmName, givenAlgorithmConstraints.constraintedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.setData(givenAlgorithmConstraints);
    }

    data: UserGivenAlgorithmConfigurationStress = undefined
}


export abstract class LayeredConfiguration extends AlgorithmConfiguration {
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
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(algorithmName, givenAlgorithmConstraints.constraintedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.setData(givenAlgorithmConstraints);
    }

    data: UserGivenAlgorithmConfigurationLayered = undefined;
}


// TODO: Maybe put each class to separate file?
export abstract class SporeConfiguration extends AlgorithmConfiguration {
    getAllRelevantConstraintKeys(): string[] {
        return super.getAllRelevantConstraintKeys().concat([
            "min_distance_between_nodes",
        ]);
    }

    constructor(
        algorithmName: AlgorithmName,
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(algorithmName, givenAlgorithmConstraints.constraintedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.setData(givenAlgorithmConstraints);
    }

    data: UserGivenAlgorithmConfigurationSpore = undefined
}



export abstract class RadialConfiguration extends AlgorithmConfiguration {
    getAllRelevantConstraintKeys(): string[] {
        return super.getAllRelevantConstraintKeys().concat([
            "min_distance_between_nodes",
        ]);
    }

    constructor(
        algorithmName: AlgorithmName,
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super(algorithmName, givenAlgorithmConstraints.constraintedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.setData(givenAlgorithmConstraints);
    }

    data: UserGivenAlgorithmConfigurationSpore = undefined
}
