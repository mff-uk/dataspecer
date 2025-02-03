import { createLogger } from "../../application";
import { DataspecerError } from "../dataspecer-error";
import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";
import { UiAssociation, UiAssociationProfile, UiAttribute, UiAttributeProfile, UiClass, UiClassProfile, UiModelState } from "./ui-model";

const LOG = createLogger(import.meta.url);

/**
 * Provide API for reading or modify {@link UiModelState}.
 */
export interface UiModelApi {

  getClass: (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => UiClass | null;

  getClassProfile: (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => UiClassProfile | null;

  getAttribute: (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => UiAttribute | null;

  getAttributeProfile: (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => UiAttributeProfile | null;

  getAssociation: (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => UiAssociation | null;

  getAssociationProfile: (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => UiAssociationProfile | null;

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

  const getClass = (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => withPrevious(prev => {
    return find(entity, vocabulary, prev.classes);
  });

  const getClassProfile = (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => withPrevious(prev => {
    return find(entity, vocabulary, prev.classProfiles);
  });

  const getAttribute = (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => withPrevious(prev => {
    return find(entity, vocabulary, prev.attributes);
  });

  const getAttributeProfile = (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => withPrevious(prev => {
    return find(entity, vocabulary, prev.attributeProfiles);
  });

  const getAssociation = (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => withPrevious(prev => {
    return find(entity, vocabulary, prev.associations);
  });

  const getAssociationProfile = (entity: EntityDsIdentifier, vocabulary: ModelDsIdentifier) => withPrevious(prev => {
    return find(entity, vocabulary, prev.associationProfiles);
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

/**
 * Find and return item with given identifier within given vocabulary.
 */
function find<T extends {
  dsIdentifier: EntityDsIdentifier,
  vocabulary: { dsIdentifier: ModelDsIdentifier },
}>(identifier: EntityDsIdentifier, vocabulary: ModelDsIdentifier, items: T[]): T | null {
  return items.find(item => item.dsIdentifier === identifier && item.vocabulary.dsIdentifier === vocabulary)
    ?? null;
}
