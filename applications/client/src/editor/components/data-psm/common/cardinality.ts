import { SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import {PimAssociationEnd, PimAttribute} from "@dataspecer/core/pim/model";

export function getCardinalityFromResource(resource: SemanticModelRelationship): string {
    return `[${resource.ends[1].cardinality?.[0] ?? "0"}..${resource.ends[1].cardinality?.[1] ?? "*"}]`;
}
