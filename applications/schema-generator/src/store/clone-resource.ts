import {CoreResource} from "@model-driven-data/core/lib/core";
import {cloneDeep} from "lodash";

export function cloneResource<ResourceType extends CoreResource | null>(from: ResourceType, alreadyExists: ResourceType | null = null): ResourceType {
    return cloneDeep(from);
}
