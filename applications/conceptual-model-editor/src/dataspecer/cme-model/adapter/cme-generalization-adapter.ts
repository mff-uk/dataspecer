import { SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { CmeGeneralization } from "../model";

export const semanticGeneralizationToCmeGeneralization = (
  semanticModel: string,
  entity: SemanticModelGeneralization,
): CmeGeneralization => {
  return {
    model: semanticModel,
    identifier: entity.id,
    iri: entity.iri,
    childIdentifier: entity.child,
    parentIdentifier: entity.parent,
  };
};
