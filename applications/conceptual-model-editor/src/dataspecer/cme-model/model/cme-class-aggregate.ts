import { LanguageString, EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { CmeClassProfileRole } from "./cme-well-known";

/**
 * Aggregated class profile.
 */
export interface CmeClassAggregate {

  aggregate: true;

  identifier: EntityDsIdentifier;

  model: ModelDsIdentifier;

  profileOf: EntityDsIdentifier[];

  iri: string | null;

  name: LanguageString | null;

  nameSource: EntityDsIdentifier | null;

  description: LanguageString | null;

  descriptionSource: EntityDsIdentifier | null;

  usageNote: LanguageString | null;

  usageNoteSource: EntityDsIdentifier | null;

  externalDocumentationUrl: string | null;

  role: CmeClassProfileRole | null;

}
