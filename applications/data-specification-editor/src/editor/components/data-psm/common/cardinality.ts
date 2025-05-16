import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { DataPsmAssociationEnd } from "@dataspecer/core/data-psm/model/data-psm-association-end";
import { DataPsmAttribute } from "@dataspecer/core/data-psm/model/data-psm-attribute";

export function getCardinalityFromResource(psmResource: DataPsmAssociationEnd | DataPsmAttribute, resource: SemanticModelRelationship, isForwardDirection: boolean = true): string {
    if (psmResource.dataPsmCardinality) {
        return `[${psmResource.dataPsmCardinality[0]}..${psmResource.dataPsmCardinality[1] ?? "*"}]`;
    }
    return `[${resource.ends[isForwardDirection ? 1 : 0].cardinality?.[0] ?? "0"}..${resource.ends[isForwardDirection ? 1 : 0].cardinality?.[1] ?? "*"}]`;
}

export function getCardinality(cardinality: [number, number | null] | null | undefined, def: [number, number | null] = [0, null]): string {
    const min = cardinality?.[0] ?? def[0];
    const max = cardinality ? cardinality[1] : def[1];
    return `[${min}..${max === null ? "*" : max}]`;
}