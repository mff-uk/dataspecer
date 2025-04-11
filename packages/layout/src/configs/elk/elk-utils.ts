import { LayoutOptions } from "elkjs";
import { AlgorithmName } from "../..";
import { UserGivenAlgorithmConfigurationInterfacesUnion } from "../user-algorithm-configurations";


export const CONFIG_TO_ELK_CONFIG_MAP: Record<keyof Omit<UserGivenAlgorithmConfigurationInterfacesUnion, "number_of_new_algorithm_runs" | "advanced_settings" | "interactive">, string[]> = {
    "layout_alg": ["elk.algorithm"],
    "alg_direction": ['elk.direction'],
    "layer_gap": ["spacing.nodeNodeBetweenLayers"],
    "in_layer_gap": ["spacing.nodeNode", "spacing.edgeNode"],

    "stress_edge_len": ["org.eclipse.elk.stress.desiredEdgeLength"],

    "force_alg_type": ["org.eclipse.elk.force.model"],
    "min_distance_between_nodes": ["spacing.nodeNode"],
    "edge_routing": ["elk.edgeRouting"],
    profileEdgeLength: [],
    preferredProfileDirection: [],
};

/**
 * This is for example for the interactive option, which 1) the conversion depends on the algorithm, 2) the mapping isn't just mapping of keys as in the {@link CONFIG_TO_ELK_CONFIG_MAP}
 */
export const configToElkConfigSpecialCasesConvertor = (algorithm: AlgorithmName, configKey: string, configValue: any): Record<string, string> | null => {
    if(configKey === "interactive" && String(configValue) === "true")  {
        return CONFIG_TO_ELK_CONFIG_SPECIAL_CASES_CONVERTOR[configKey]?.[algorithm] ?? null;
    }
    else {
        return null
    }

};

const CONFIG_TO_ELK_CONFIG_SPECIAL_CASES_CONVERTOR: Record<string, Record<AlgorithmName, Record<string, string>>> = {
    "interactive": {
        "elk_layered": {
            // "crossingMinimization.semiInteractive": true,
            "crossingMinimization.strategy": "INTERACTIVE",		// This is more aggressive (preserves given input more) than the crossingMinimization.seminteractive property
            "crossingCounterNodeInfluence": "0",
            "cycleBreaking.strategy": "INTERACTIVE",
        },
        "elk_stress": {
            "interactive": "true",
        },
        "elk_force": {
            "interactive": "true",
        },
        none: undefined,
        random: undefined,
        elk_radial: undefined,
        elk_overlapRemoval: undefined,
        elk_stress_advanced_using_clusters: {
            "interactive": "true",
        },
        elk_stress_profile: {
            "interactive": "true"
        },
        automatic: undefined
    }
};

export const ALGORITHM_TO_ELK_ALGORITHM_MAP: Record<AlgorithmName, string> = {
    elk_stress: "stress",
    elk_layered: "layered",
    elk_force: "force",
    elk_radial: "radial",
    elk_overlapRemoval: "sporeOverlap",
    elk_stress_profile: "stress",
    none: "not elk algorithm",
    random: "not elk algorithm",
    elk_stress_advanced_using_clusters: "stress",
    automatic: "not elk algorithm",
};


/**
 * Helper method which maps relevant properties from {@link data} to elk type data and stores them into {@link elkData}.
 * Special case is if given {@link data} contains advanced_settings field, then the whole field is copied into the {@link elkData}.
 * @param data is the input on which is the {@link elkData} changed
 * @param elkData is the changed object
 */
export function modifyElkDataObject(data: object, elkData: LayoutOptions): void {
    let hasAdvancedSettings: boolean = false;
    Object.entries(data).forEach(([key, value]) => {
        if(key === "advanced_settings") {
            hasAdvancedSettings = true;
            return;
        }

        CONFIG_TO_ELK_CONFIG_MAP[key]?.forEach(elkName => {
            elkData[elkName] = data[key];
        });

        const newElkEntries = configToElkConfigSpecialCasesConvertor(data['layout_alg'], key, value);
        if(newElkEntries !== null) {
            Object.entries(newElkEntries).forEach(([key, value]) => {
                elkData[key] = value;
            });
        }
    });

    if(hasAdvancedSettings) {
        if(data["advanced_settings"] !== undefined && Object.keys(data["advanced_settings"]).length > 0) {
            Object.entries(data["advanced_settings"]).forEach(([key, value]) => {
                elkData[key] = String(value);
            });
        }
    }
    if(data['layout_alg'] !== undefined) {
        elkData[CONFIG_TO_ELK_CONFIG_MAP['layout_alg'][0]] = ALGORITHM_TO_ELK_ALGORITHM_MAP[data['layout_alg']];
    }

    console.log("elkData");
    console.log(elkData);
}
