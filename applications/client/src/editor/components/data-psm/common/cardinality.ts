import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";

export function getCardinalityFromResource(resource: SemanticModelRelationship): string {
    return `[${resource.ends[1].cardinality?.[0] ?? "0"}..${resource.ends[1].cardinality?.[1] ?? "*"}]`;
}
