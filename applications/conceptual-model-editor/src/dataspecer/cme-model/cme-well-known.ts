import { CmeModel, CmeModelType } from "./cme-model";

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
  displayColor: "#000069",
  dsModelType: CmeModelType.Default,
  baseIri: "https://www.w3.org/2002/07/owl",
};
