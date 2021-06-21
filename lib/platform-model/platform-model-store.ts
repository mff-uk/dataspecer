import {ModelResource} from "./platform-model-api";

export type Store = Record<string, ModelResource>;

export function mergeStore(...stores: Store[]): Store {
    // todo: Implement properly. Merge instead of override
    return stores.reduce((accumulator, current) => ({...accumulator, ...current}), {});
}