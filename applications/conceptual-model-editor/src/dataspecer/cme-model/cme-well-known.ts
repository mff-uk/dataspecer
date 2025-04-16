import { CmeEntity } from "./model";
import { CmePrimitiveType } from "./model/cme-primitive-type";
import { CmeSemanticModel, CmeSemanticModelType } from "./model/cme-semantic-model";

export const UnknownCmeSemanticModel: CmeSemanticModel = {
  identifier: "unknown-cme-vocabulary",
  name: { "": "Unknown vocabulary" },
  color: "#99028c",
  modelType: CmeSemanticModelType.DefaultSemanticModel,
  baseIri: null,
};
Object.freeze(UnknownCmeSemanticModel);

/**
 * Represent broken or unknown entities.
 */
export const UnknownCmeEntity: CmeEntity = {
  identifier: "unknown-cme-entity-type",
  iri: null,
  model: UnknownCmeSemanticModel.identifier,
  name: { "": "Unknown entity" },
};
Object.freeze(UnknownCmeEntity);

/**
 * Represents null for entity references.
 */
export const UnspecifiedCmeEntity: CmeEntity = {
  identifier: "unspecified-cme-entity-type",
  iri: null,
  model: UnknownCmeSemanticModel.identifier,
  name: { "": "Unspecified entity" },
};
Object.freeze(UnspecifiedCmeEntity);

export const UnknownCmePrimitiveType: CmePrimitiveType = {
  identifier: "unknown-cme-primitive-type",
  iri: null,
  model: UnknownCmeSemanticModel.identifier,
  name: { "": "Unknown primitive type" },
};
Object.freeze(UnknownCmePrimitiveType);

export const OwlSemanticModel: CmeSemanticModel = {
  identifier: "https://www.w3.org/2002/07/owl",
  name: { "": "owl" },
  color: "#99028c",
  modelType: CmeSemanticModelType.DefaultSemanticModel,
  baseIri: "https://www.w3.org/2002/07/owl",
};
Object.freeze(OwlSemanticModel);
