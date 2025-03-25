import { CmeSemanticModel, CmeSemanticModelType } from "./model/cme-semantic-model";

/**
 * We should not need this, yet due to current design
 * we need to represent a situation where there is an entity without
 * a vocabulary.
 *
 * @deprecated
 */
export const UndefinedCmeVocabulary : CmeSemanticModel = {
  dsIdentifier: "undefined-cme-vocabulary",
  displayLabel: {},
  displayColor: "#000069",
  dsModelType: CmeSemanticModelType.Default,
  baseIri: null,
};

/**
 * We should not need this, yet due to current design
 * we need to represent the owl:Thing entity.
 */
export const OwlVocabulary : CmeSemanticModel = {
  dsIdentifier: "https://www.w3.org/2002/07/owl",
  displayLabel: {"": "owl"},
  displayColor: "#000069",
  dsModelType: CmeSemanticModelType.Default,
  baseIri: "https://www.w3.org/2002/07/owl",
};
