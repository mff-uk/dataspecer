import { LayoutOptions } from "elkjs";
import { AlgorithmConfiguration, LayeredConfiguration, SporeConfiguration, StressConfiguration, UserGivenAlgorithmConfiguration, UserGivenAlgorithmConfigurationElkForce } from "../constraints";
import { createElkDataObject } from "./elk-utils";
import _ from "lodash";


export type ElkForceAlgType = "FRUCHTERMAN_REINGOLD" | "EADES";


/**
 * @deprecated Probably replaced by {@link ElkConstraint}
 */
export interface ElkConstraintSimple extends AlgorithmConfiguration {
    data: LayoutOptions;
}

export interface ElkConstraint {
    elkData: LayoutOptions;
}


export class ElkLayeredConfiguration extends LayeredConfiguration implements ElkConstraint {
    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration) {
        super(givenAlgorithmConstraints);
        createElkDataObject(this.data, this.elkData);
        // TODO: For now - hardcoded
        this.elkData['elk.edgeRouting'] = "SPLINES";
        this.elkData['spacing.edgeEdge'] = "25";

        // TODO: DEBUG
        // console.log(this.data);
        // console.log(this.elkData);
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


export class ElkStressConfiguration extends StressConfiguration implements ElkConstraint {
    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration) {
        super(givenAlgorithmConstraints);
        createElkDataObject(this.data, this.elkData);
    }

    elkData: LayoutOptions = {};
}


// TODO: For now just extend AlgorithmConfiguration, don't make separate general class for Force algorithms as in case of stress,
// because right now I am slightly confused what actually is the mapping between the physical based algorithms (d3 = Stress + Force + more)
// but I can extend only one of them, I guess that I could create combination, but still it doesn't seem correct 1:1 mapping and the Elk force has
// the option to set the physical model in configuration, which D3 doesn't have
export class ElkForceConfiguration extends AlgorithmConfiguration implements ElkConstraint {
    getAllConstraintKeys(): string[] {
        return super.getAllConstraintKeys().concat([
            "force_alg_type",
            "min_distance_between_nodes",
        ]);
    }

    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration) {
        super(givenAlgorithmConstraints.layout_alg, givenAlgorithmConstraints.constraintedNodes);
        this.data = _.pick(givenAlgorithmConstraints, this.getAllConstraintKeys()) as UserGivenAlgorithmConfigurationElkForce;
        createElkDataObject(this.data, this.elkData);

        // TODO: For now - hardcoded
        if(this.elkData["org.eclipse.elk.force.model"] === "EADES") {
            this.elkData["org.eclipse.elk.force.repulsion"] = "25.0";
        }
        else {
            this.elkData["elk.force.temperature"] = "0.1";
        }
        // TODO: For now
        this.elkData["org.eclipse.elk.randomSeed"] = "0";
    }

    data: UserGivenAlgorithmConfigurationElkForce = undefined;
    // I can further enforce the typing by creating type which takes into consideration only used parameters and not those which can't be used
    // (For example those for layered algorithm), but I won't
    elkData: LayoutOptions = {};
}


export class ElkSporeConfiguration extends SporeConfiguration implements ElkConstraint {
    constructor(givenAlgorithmConstraints: UserGivenAlgorithmConfiguration) {
        super(givenAlgorithmConstraints);
        createElkDataObject(this.data, this.elkData);
    }

    elkData: LayoutOptions = {};
}