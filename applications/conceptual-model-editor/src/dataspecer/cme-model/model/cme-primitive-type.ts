import { LanguageString, EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";

/**
 * Represent a datatype.
 */
export interface CmePrimitiveType {

  model: ModelDsIdentifier;

  identifier: EntityDsIdentifier;

  iri: string | null;

  name: LanguageString | null;

}
