import { LayoutOptions } from "elkjs";
import { AlgorithmName, UserGivenAlgorithmConfigurationOnlyData } from "../..";


// Note for myself: alternatively could define the type as Omit<Record<keyof UserGivenConstraints, string[]>, "double_run" | "process_general_separately">
export const CONFIG_TO_ELK_CONFIG_MAP: Record<keyof UserGivenAlgorithmConfigurationOnlyData, string[]> = {
    "layout_alg": ["elk.algorithm"],
    "alg_direction": ['elk.direction'],
    "layer_gap": ["spacing.nodeNodeBetweenLayers"],
    "in_layer_gap": ["spacing.nodeNode", "spacing.edgeNode"],

    "stress_edge_len": ["org.eclipse.elk.stress.desiredEdgeLength"],

    "force_alg_type": ["org.eclipse.elk.force.model"],
    "min_distance_between_nodes": ["spacing.nodeNode"],
};

export const ALGORITHM_TO_ELK_ALGORITHM_MAP: Pick<Record<AlgorithmName, string>, "elk_stress" | "elk_layered" | "elk_force"> = {
    "elk_stress": "stress",
    "elk_layered": "layered",
    "elk_force": "force",
};


export function createElkDataObject(data: object, elkData: LayoutOptions): void {
    // TODO: Could be rewritten in such a way that when one key is mapped to multiple values, then there is some scaling function, instead
    //       of just setting all of the options to the same value
    Object.keys(data).forEach(k => {
                CONFIG_TO_ELK_CONFIG_MAP[k]?.forEach(elkName => {
                    elkData[elkName] = data[k];
                });
            });
    elkData[CONFIG_TO_ELK_CONFIG_MAP['layout_alg'][0]] = ALGORITHM_TO_ELK_ALGORITHM_MAP[data['layout_alg']];
}