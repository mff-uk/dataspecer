import { LayoutOptions } from "elkjs";
import {
    AlgorithmPhases,
    AlgorithmConfiguration,
    LayeredConfiguration,
    RadialConfiguration,
    SporeConfiguration,
    StressConfiguration,
    UserGivenAlgorithmConfiguration,
    UserGivenAlgorithmConfigurationElkForce,
    UserGivenAlgorithmConfigurationStressProfile
} from "../constraints";
import { modifyElkDataObject } from "./elk-utils";
import _ from "lodash";


export type ElkForceAlgType = "FRUCHTERMAN_REINGOLD" | "EADES";

export interface ElkConstraint {
    elkData: LayoutOptions;
}


/**
 * Stores configuration for elk layered algorithm
 */
export class ElkLayeredConfiguration extends LayeredConfiguration implements ElkConstraint {
    constructor(
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super("elk_layered", givenAlgorithmConstraints, shouldCreateNewGraph, algorithmPhasesToCall);
        console.log("elkData in LayeredConfiguration");
        console.log(_.cloneDeep(this.elkData));

        // Hardcoded defaults
        this.elkData["elk.edgeRouting"] = "SPLINES";
        this.elkData["spacing.edgeEdge"] = "10";
        this.elkData["org.eclipse.elk.spacing.nodeSelfLoop"] = "150";

        modifyElkDataObject(this.data, this.elkData);

        console.log("elkData in ElkLayeredConfiguration");
        console.log(_.cloneDeep(this.elkData));
        // TODO: DEBUG
        // console.log(this.data);
        // console.log(this.elkData);
    }

    addAdvancedSettingsForUnderlying(advancedSettings: object) {
        modifyElkDataObject({"advanced_settings": advancedSettings}, this.elkData);
    }

    addAlgorithmConstraintForUnderlying(key: string, value: string): void {
        modifyElkDataObject({[key]: value, "layout_alg": this.algorithmName}, this.elkData);
    }

    elkData: LayoutOptions = {};



    // TODO: Old commented code to pick only the relevant stuff from the given configuration, right now we just don't care, we can implement this if stuff starts breaking

// const getValidConfig = () => {
    //     if(config['main_layout_alg'] === "random") {
    //         return {
    //             'main-alg-config': {
    //                 "constraintedNodes": "ALL",
    //                 "data": {
    //                     "main-layout-alg": config['main_layout_alg']
    //                 }
    //             }
    //         };
    //     }
    //     let validConfig: Record<string, IConstraintSimple> = {};
    //     if(config['main_layout_alg'] === "elk_stress") {
    //         validConfig = {
    //             'main-alg-config': {
    //                 "constraintedNodes": "ALL",
    //                 "data": {
    //                     "main-layout-alg": config['main_layout_alg'],
    //                     "stress-edge-len": config['stress_edge_len']
    //                 }
    //             }
    //         };
    //     }
    //     else if(config['main_layout_alg'] === "elk_force") {
    //         validConfig = {
    //             'main-alg-config': {
    //                 "constraintedNodes": "ALL",
    //                 "data": {
    //                     "main-layout-alg": config['main_layout_alg'],
    //                     "min-distance-between-nodes": config['min_distance_between_nodes'],
    //                     "force-alg-type": config['force_alg_type'],
    //                 }
    //             }
    //         };
    //     }
    //     else {
    //         validConfig = {
    //             'main-alg-config': {
    //                 "constraintedNodes": "ALL",
    //                 "data": {
    //                     "main-layout-alg": config['main_layout_alg'],
    //                     "main-alg-direction": config["main_alg_direction"],
    //                     "layer-gap": config["layer_gap"],
    //                     "in-layer-gap": config["in_layer_gap"],
    //                 }
    //             }
    //         };
    //     }

    //     if(config['process_general_separately']) {
    //         validConfig = {
    //             ...validConfig,
    //             'general-config': {
    //                 "constraintedNodes": "GENERALIZATION",
    //                 "data": {
    //                     "main-layout-alg": "layered",       // TODO: Just fix it for now (layered is usually the best choice for generalization hierarchy anyways)
    //                     "general-main-alg-direction": config['general_main_alg_direction'],
    //                     "general-layer-gap": config['general_layer_gap'],
    //                     "general-in-layer-gap": config['general_in_layer_gap'],
    //                 }
    //             }
    //         };

    //         if(config["double_run"]) {
    //             validConfig = {
    //                 ...validConfig,
    //                 'general-config-double-run': {
    //                     "constraintedNodes": "GENERALIZATION",
    //                     "data": {
    //                         "double-run": config["double_run"],
    //                     }
    //                 }
    //             }
    //         }
    //     }

    //     return validConfig;
    // }
}


/**
 * Stores configuration for elk stress algorithm
 */
export class ElkStressConfiguration extends StressConfiguration implements ElkConstraint {
    constructor(
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super("elk_stress", givenAlgorithmConstraints, shouldCreateNewGraph, algorithmPhasesToCall);
        modifyElkDataObject(this.data, this.elkData);
    }

    addAdvancedSettingsForUnderlying(advancedSettings: object) {
        modifyElkDataObject({"advanced_settings": advancedSettings}, this.elkData);
    }
    addAlgorithmConstraintForUnderlying(key: string, value: string): void {
        modifyElkDataObject({[key]: value, "layout_alg": this.algorithmName}, this.elkData);
    }

    elkData: LayoutOptions = {};
}

export class ElkStressProfileLayoutConfiguration extends StressConfiguration implements ElkConstraint {
    getAllRelevantConstraintKeys() {
        return super.getAllRelevantConstraintKeys().concat([
            "profileEdgeLength",
            "preferredProfileDirection",
        ]);
    }

    constructor(
        givenAlgorithmConstraints: UserGivenAlgorithmConfiguration,
        shouldCreateNewGraph: boolean,
        algorithmPhasesToCall?: AlgorithmPhases
    ) {
        super("elk_stress_profile", givenAlgorithmConstraints, shouldCreateNewGraph, algorithmPhasesToCall);
        this.setData(givenAlgorithmConstraints);
        modifyElkDataObject(this.data, this.elkData);
    }

    addAdvancedSettingsForUnderlying(advancedSettings: object) {
        modifyElkDataObject({"advanced_settings": advancedSettings}, this.elkData);
    }
    addAlgorithmConstraintForUnderlying(key: string, value: string): void {
        modifyElkDataObject({[key]: value, "layout_alg": this.algorithmName}, this.elkData);
    }

    elkData: LayoutOptions = {};
    // TODO RadStr: This is nice, but it would be better to use getter which just converts the data: object into this type
    //              I don't need to solve the issues oh having 2 data objects (I have only 1 accessible, but I have to set it here)
    data: UserGivenAlgorithmConfigurationStressProfile = undefined;
}



// TODO: For now just extend AlgorithmConfiguration, don't make separate general class for Force algorithms as in case of stress,
// because right now I am slightly confused what actually is the mapping between the physical based algorithms (d3 = Stress + Force + more)
// but I can extend only one of them, I guess that I could create combination, but still it doesn't seem correct 1:1 mapping and the Elk force has
// the option to set the physical model in configuration, which D3 doesn't have

/**
 * Stores configuration for elk force algorithm
 */
export class ElkForceConfiguration extends AlgorithmConfiguration implements ElkConstraint {
    getAllRelevantConstraintKeys(): string[] {
        return super.getAllRelevantConstraintKeys().concat([
            "force_alg_type",
            "min_distance_between_nodes",
        ]);
    }

    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration, shouldCreateNewGraph: boolean, algorithmPhasesToCall?: AlgorithmPhases) {
        super(givenAlgorithmConstraints.layout_alg, givenAlgorithmConstraints.constraintedNodes, shouldCreateNewGraph, algorithmPhasesToCall);
        this.data = _.pick(givenAlgorithmConstraints, this.getAllRelevantConstraintKeys()) as UserGivenAlgorithmConfigurationElkForce;
        modifyElkDataObject(this.data, this.elkData);

        // TODO: For now - hardcoded
        if(this.elkData["org.eclipse.elk.force.model"] === "EADES") {
            this.elkData["org.eclipse.elk.force.repulsion"] = "25.0";
        }
        else {
            this.elkData["elk.force.temperature"] = "0.1";
        }
        // TODO: For now
        // Random seed == 0 means that the seed is chosen randomly. Seed sets the initial position of nodes
        this.elkData["org.eclipse.elk.randomSeed"] = "0";
    }

    addAdvancedSettingsForUnderlying(advancedSettings: object) {
        modifyElkDataObject({"advanced_settings": advancedSettings}, this.elkData);
    }
    addAlgorithmConstraintForUnderlying(key: string, value: string): void {
        modifyElkDataObject({[key]: value, "layout_alg": this.algorithmName}, this.elkData);
    }

    data: UserGivenAlgorithmConfigurationElkForce = undefined;
    // I can further enforce the typing by creating type which takes into consideration only used parameters and not those which can't be used
    // (For example those for layered algorithm), but I won't
    elkData: LayoutOptions = {};
}


/**
 * Stores configuration for elk spore algorithm
 */
export class ElkSporeCompactionConfiguration extends SporeConfiguration implements ElkConstraint {
    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration, shouldCreateNewGraph: boolean, algorithmPhasesToCall?: AlgorithmPhases) {
        super("sporeCompaction", givenAlgorithmConstraints, shouldCreateNewGraph, algorithmPhasesToCall);
        modifyElkDataObject(this.data, this.elkData);
    }

    // TODO: Copy paste of this method for every Elk class, I am not sure if there is way to do it without - some mixin or seomthing, same for addAlgorithmConstraintForUnderlying
    addAdvancedSettingsForUnderlying(advancedSettings: object) {
        modifyElkDataObject({"advanced_settings": advancedSettings}, this.elkData);
    }
    addAlgorithmConstraintForUnderlying(key: string, value: string): void {
        modifyElkDataObject({[key]: value, "layout_alg": this.algorithmName}, this.elkData);
    }


    elkData: LayoutOptions = {};
}


/**
 * Stores configuration for elk radial algorithm
 */
export class ElkRadialConfiguration extends RadialConfiguration implements ElkConstraint {
    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration, shouldCreateNewGraph: boolean, algorithmPhasesToCall?: AlgorithmPhases) {
        super("elk_radial", givenAlgorithmConstraints, shouldCreateNewGraph, algorithmPhasesToCall);
        modifyElkDataObject(this.data, this.elkData);
    }

    addAdvancedSettingsForUnderlying(advancedSettings: object) {
        modifyElkDataObject({"advanced_settings": advancedSettings}, this.elkData);
    }
    addAlgorithmConstraintForUnderlying(key: string, value: string): void {
        modifyElkDataObject({[key]: value, "layout_alg": this.algorithmName}, this.elkData);
    }

    elkData: LayoutOptions = {};
}


/**
 * Stores configuration for elk sporeOverlap algorithm
 */
export class ElkSporeOverlapConfiguration extends SporeConfiguration implements ElkConstraint {
    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration, shouldCreateNewGraph: boolean, algorithmPhasesToCall?: AlgorithmPhases) {
        super("elk_overlapRemoval", givenAlgorithmConstraints, shouldCreateNewGraph, algorithmPhasesToCall);
        modifyElkDataObject(this.data, this.elkData);
    }

    addAdvancedSettingsForUnderlying(advancedSettings: object) {
        modifyElkDataObject({"advanced_settings": advancedSettings}, this.elkData);
    }
    addAlgorithmConstraintForUnderlying(key: string, value: string): void {
        modifyElkDataObject({[key]: value, "layout_alg": this.algorithmName}, this.elkData);
    }

    elkData: LayoutOptions = {};
}
