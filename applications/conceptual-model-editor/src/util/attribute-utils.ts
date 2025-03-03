import { isSemanticModelRelationship, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { getDomainAndRange } from "./relationship-utils";

export function isAttributeDomainInVisualModel(
  visualModel: VisualModel | null,
  attribute: SemanticModelRelationship
      | SemanticModelRelationshipUsage
      | SemanticModelRelationshipProfile,
): boolean {
  if (visualModel === null) {
    return false;
  }

  let domainConcept = "";
  if (isSemanticModelRelationship(attribute)) {
    const { domain } = getDomainAndRange(attribute);
    domainConcept = domain?.concept ?? "";
  } else {
    const { domain } = getDomainAndRange(attribute);
    domainConcept = domain?.concept ?? "";
  }

  const isDomainOnCanvas = visualModel.getVisualEntityForRepresented(domainConcept) !== null;
  return isDomainOnCanvas;
}