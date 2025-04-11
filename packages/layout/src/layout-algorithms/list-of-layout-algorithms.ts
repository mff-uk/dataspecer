import { AutomaticLayout } from "./implementations/automatic-layout";
import { RandomLayout } from "./implementations/basic-layout";
import { ElkLayout } from "./implementations/elk-layout";
import { ElkProfileLayout } from "./implementations/elk-profile-specific-layout";
import { NoActionLayout } from "./implementations/no-action-layouts";
import { LayoutAlgorithm } from "./layout-algorithms-interfaces";

export type AlgorithmName = "none" | "elk_stress" | "elk_layered" | "elk_force" | "random" |
                            "elk_radial" | "elk_overlapRemoval" |
                            "elk_stress_advanced_using_clusters" | "elk_stress_profile" |
                            "automatic";

export const ALGORITHM_NAME_TO_LAYOUT_MAPPING: Record<AlgorithmName, LayoutAlgorithm> = {
    "elk_stress": new ElkLayout(),
    "elk_layered": new ElkLayout(),
    "elk_force": new ElkLayout(),
    "random": new RandomLayout(),
    "elk_radial": new ElkLayout(),
    "elk_overlapRemoval": new ElkLayout(),
    "elk_stress_advanced_using_clusters": new ElkLayout(),
    "elk_stress_profile": new ElkProfileLayout(),
    "none": new NoActionLayout(),
    "automatic": new AutomaticLayout(),
}

// TODO: Theoretically you can create the same map for the ConfigurationsContainer and for the UserConfiguration
//       or at least use map, the map forces me to add the code unlike the switch