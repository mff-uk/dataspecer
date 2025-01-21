import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";
import { UiAssociation, UiAssociationProfile, UiAttribute, UiAttributeProfile, UiClass, UiClassProfile, UiModel } from "./ui-model";

/**
 * Provide context for reading current values.
 * The context does not change when values change.
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
  getPrevious: () => UiModel | null,
  setNext: (next: UiModel) => void,
): UiModelApi {

}
