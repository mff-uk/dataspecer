import { Entity } from "@dataspecer/core-v2";
import { SemanticModelAggregator } from "@dataspecer/core-v2/semantic-model/aggregator";
import { isSemanticModelRelationshipProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { isRepresentingAttribute } from "../../dialog/utilities/dialog-utilities";

// This is to compile with TypeScript as we can not use
// the type directly for aggregator.
const _SemanticModelAggregatorInstance = new SemanticModelAggregator();

export type SemanticModelAggregatorType = typeof _SemanticModelAggregatorInstance;

export function isSemanticModelAttributeProfile(
  resource: Entity | null,
): resource is SemanticModelRelationshipProfile {
  if (!isSemanticModelRelationshipProfile(resource)) {
    return false;
  }
  // We just convert this to known problem.
  // As we do not know which end is the right one, we just try both of them.
  return isRepresentingAttribute({
    identifier: resource.id,
    range: resource.ends[0]?.concept
  }) || isRepresentingAttribute({
    identifier: resource.id,
    range: resource.ends[1]?.concept
  });
}
