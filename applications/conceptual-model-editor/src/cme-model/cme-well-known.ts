import { CmeModelType, CmeModel } from "./cme-model";

/**
 * We should not need this, yet due to current design
 * we need to represent a situation where there is an entity without
 * a vocabulary.
 *
 * @deprecated
 */
export const UndefinedCmeVocabulary : CmeModel = {
  dsIdentifier: "undefined-cme-vocabulary",
  displayLabel: {},
  displayDescription: null,
  displayColor: "#000069",
  dsModelType: CmeModelType.Default,
  baseIri: null,
};

/**
 * We should not need this, yet due to current design
 * we need to represent the owl:Thing entity.
 */
export const OwlVocabulary : CmeModel = {
  dsIdentifier: "https://www.w3.org/2002/07/owl",
  displayLabel: {"": "owl"},
  displayDescription: null,
  displayColor: "#000069",
  dsModelType: CmeModelType.Default,
  baseIri: "https://www.w3.org/2002/07/owl",
};
