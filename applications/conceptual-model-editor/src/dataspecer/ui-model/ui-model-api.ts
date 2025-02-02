import { createLogger } from "../../application";
import { DataspecerError } from "../dataspecer-error";
import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";
import { UiAssociation, UiAssociationProfile, UiAttribute, UiAttributeProfile, UiClass, UiClassProfile, UiModelState } from "./ui-model";

const LOG = createLogger(import.meta.url);

/**
 * Provide API for reading or modify {@link UiModelState}.
 */
export interface UiModelApi {

  getClass: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiClass | null;

  getClassProfile: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiClassProfile | null;

  getAttribute: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiAttribute | null;

  getAttributeProfile: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiAttributeProfile | null;

  getAssociation: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiAssociation | null;

  getAssociationProfile: (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => UiAssociationProfile | null;

}

export function createUiModelApi(
  getPrevious: () => UiModelState | null,
): UiModelApi {

  const withPrevious = <T>(callback: (prev: UiModelState) => T) => {
    const previous = getPrevious();
    if (previous === null) {
      LOG.warn("Ignored API call on ui-model as the state is null.");
      throw new DataspecerError("dataspecer.ui-model.state-is-null");
    } else {
      return callback(previous);
    }
  };

  //

  const getClass = (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => withPrevious(prev => {
    return find(identifier, model, prev.classes);
  });

  const getClassProfile = (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => withPrevious(prev => {
    return find(identifier, model, prev.classProfiles);
  });

  const getAttribute = (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => withPrevious(prev => {
    return find(identifier, model, prev.attributes);
  });

  const getAttributeProfile =  (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => withPrevious(prev => {
    return find(identifier, model, prev.attributeProfiles);
  });

  const getAssociation =  (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => withPrevious(prev => {
    return find(identifier, model, prev.associations);
  });

  const getAssociationProfile = (identifier: EntityDsIdentifier, model: ModelDsIdentifier) => withPrevious(prev => {
    return find(identifier, model, prev.associationProfiles);
  });

  return {
    getClass,
    getClassProfile,
    getAttribute,
    getAttributeProfile,
    getAssociation,
    getAssociationProfile,
  };
}

function find<T extends {
  dsIdentifier: EntityDsIdentifier,
  model: {
    dsIdentifier: ModelDsIdentifier,
  },
}>(identifier: EntityDsIdentifier, model: ModelDsIdentifier, items: T[]): T | null {
  return items.find(item => item.dsIdentifier === identifier && item.model.dsIdentifier === model)
    ?? null;
}
