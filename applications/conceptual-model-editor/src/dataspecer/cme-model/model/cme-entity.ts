import { EntityDsIdentifier, LanguageString, ModelDsIdentifier } from "../../entity-model";

/**
 * We can use this as a common ancestor of
 */
export interface CmeEntity {

  model: ModelDsIdentifier;

  identifier: EntityDsIdentifier;

  iri: string | null;

  name: LanguageString | null;

}
