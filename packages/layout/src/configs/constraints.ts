import { IGraphClassic, IMainGraphClassic } from "../graph-iface"
import { DIRECTION } from "../util/utils";
import { AlgorithmName } from "./constraint-container";
import _ from "lodash";
import { ElkForceAlgType } from "./elk/elk-constraints";
import { NodeDimensionQueryHandler, UserGivenConstraintsVersion2 } from "..";
import { compactify } from "./constraints-implementation";


export type ConstraintedNodesGroupingsType = "ALL" | "GENERALIZATION" | "PROFILE" | "ALL-TOP-LEVEL";


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
//                                            "profile-nodes-position-against-source": DIRECTION.DOWN,
        "main_alg_direction": DIRECTION,
        "layer_gap": number,
        "in_layer_gap": number,

        "stress_edge_len": number,

        "min_distance_between_nodes": number,
        "force_alg_type": ElkForceAlgType,

        "general_main_alg_direction": DIRECTION,
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

interface AlgorithmConstraint {
    chosenAlgorithm: AlgorithmName,
    algorithmSettings: Partial<Record<AlgorithmName, UserGivenAlgorithmConfiguration>>,
    constraintedNodes: ConstraintedNodesGroupingsType | string[],       // Either grouping or list of individual nodes
}

interface AlgorithmConversionConstraint {
    actionName: string,
    data: object,
    constraintedNodes: ConstraintedNodesGroupingsType | string[],       // Either grouping or list of individual nodes
}

export interface UserGivenAlgorithmConfigurationslVersion3 {
    steps: (AlgorithmConstraint | AlgorithmConversionConstraint)[],
}

export interface UserGivenAlgorithmConfigurationslVersion3 {
    steps: (AlgorithmConstraint | AlgorithmConversionConstraint)[],
}

export function getDefaultUserGivenConstraintsVersion3(): (AlgorithmConstraint | AlgorithmConversionConstraint)[] {
    return [
            {
                actionName: "CREATE_GENERAL_SUBGRAPHS",
                data: {},
                constraintedNodes: "ALL",
            },
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

function getDefaultAdditionalStepsForVersion4ExampleImplementation(): Record<number, (UserGivenAlgorithmConfiguration | AlgorithmConversionConstraint)> {
    return {
        0: {
            actionName: "CREATE_GENERALIZATION_SUBGRAPHS",
            data: {},
            constraintedNodes: "ALL",
        },
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
    additionalSteps: Record<number, (UserGivenAlgorithmConfiguration | AlgorithmConversionConstraint)>,
}


export interface UserGivenAlgorithmConfigurationLayered {
    "alg_direction": DIRECTION,
    "layer_gap": number,
    "in_layer_gap": number,
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
    return {
        "layout_alg": algorithmName,
    //  "profile-nodes-position-against-source": DIRECTION.DOWN,
        ...LayeredConfiguration.getDefaultObject(),
        "stress_edge_len": 400,

        "force_alg_type": "FRUCHTERMAN_REINGOLD",
        "min_distance_between_nodes": 100,
        "number_of_new_algorithm_runs": 50,
        "run_layered_after": false,
        "interactive": false,
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

export interface IAlgorithmOnlyConstraint extends IConstraintSimple {
    algorithmName: AlgorithmName;
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
    // modelID: string = undefined;        // TODO: For now just undefined no matter what, I am still not sure how will it work with models

    getAllRelevantConstraintKeys() {
        let constraintKeys = [
            "layout_alg",
            "interactive",
        ];


        return constraintKeys;
    }

    constructor(algorithmName: AlgorithmName, constrainedNodes: ConstraintedNodesGroupingsType) {
        this.algorithmName = algorithmName;
        this.constraintedNodes = constrainedNodes;
        this.type = "ALG";
    }
    abstract addAlgorithmConstraintForUnderlying(key: string, value: string): void;
    abstract addAdvancedSettingsForUnderlying(advancedSettings: object): void;

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

    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration) {
        super(givenAlgorithmConstraints.layout_alg, givenAlgorithmConstraints.constraintedNodes);
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
            "alg_direction": DIRECTION.UP,
            "layer_gap": 100,
            "in_layer_gap": 100,
        }
    }
    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration) {
        super(givenAlgorithmConstraints.layout_alg, givenAlgorithmConstraints.constraintedNodes);
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

    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration) {
        super(givenAlgorithmConstraints.layout_alg, givenAlgorithmConstraints.constraintedNodes);
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

    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration) {
        super(givenAlgorithmConstraints.layout_alg, givenAlgorithmConstraints.constraintedNodes);
        this.setData(givenAlgorithmConstraints);
    }

    data: UserGivenAlgorithmConfigurationSpore = undefined
}
