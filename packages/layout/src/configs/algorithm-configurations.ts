import { AlgorithmName } from "../layout-algorithms/list-of-layout-algorithms";
import { AffectedNodesGroupingsType, MemoryAllocationControl } from "./constraints";
import { Constraint, UserGivenAlgorithmConfigurationAutomatic, UserGivenAlgorithmConfigurationBase, UserGivenAlgorithmConfigurationLayered, UserGivenAlgorithmConfigurationRadial, UserGivenAlgorithmConfigurationRandom, UserGivenAlgorithmConfigurationStressBase } from "./user-algorithm-configurations";

export type AlgorithmPhases = "ONLY-PREPARE" | "ONLY-RUN" | "PREPARE-AND-RUN";

export interface AlgorithmOnlyConstraint<T extends UserGivenAlgorithmConfigurationBase> extends Constraint<T>, MemoryAllocationControl {
    /**
     * Default is "PREPARE-AND-RUN", other values need to be explicitly set in constructor -
     * You should set it to other value only in case if you know that algorithm can be prepared once and then run multiple times.
     * - For example force algorithm needs to be prepared only once before going into the main loop where it is iteratively called with different seeds
     */
    algorithmPhasesToCall: AlgorithmPhases;
}

export interface AlgorithmConfiguration<T extends UserGivenAlgorithmConfigurationBase> extends AlgorithmOnlyConstraint<T> {
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
    protected abstract addAlgorithmConstraintForUnderlying(key: string, value: string): void;
    protected abstract addAdvancedSettingsForUnderlying(advancedSettings: object): void;

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
    static getDefaultUserConfiguration(): UserGivenAlgorithmConfigurationRandom {
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
    static getDefaultUserConfiguration(): UserGivenAlgorithmConfigurationAutomatic {
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
