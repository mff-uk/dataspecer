import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";

export function getCardinalityFromResource(resource: SemanticModelRelationship): string {
    return `[${resource.ends[1].cardinality?.[0] ?? "0"}..${resource.ends[1].cardinality?.[1] ?? "*"}]`;
}

export function getCardinality(cardinality: [number, number | null] | null | undefined, def: [number, number | null] = [0, null]): string {
    const min = cardinality?.[0] ?? def[0];
    const max = cardinality ? cardinality[1] : def[1];
    return `[${min}..${max === null ? "*" : max}]`;
}