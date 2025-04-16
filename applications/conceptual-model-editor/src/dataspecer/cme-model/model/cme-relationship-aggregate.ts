import { LanguageString, EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { CmeCardinality } from "./cme-cardinality";
import { CmeEntity } from "./cme-entity";
import { CmeRelationshipProfileMandatoryLevel } from "./cme-well-known";

/**
 * Aggregated relationship profile.
 */
export interface CmeRelationshipAggregate extends CmeEntity {

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

  domain: EntityDsIdentifier;

  domainCardinality: CmeCardinality | null;

  range: EntityDsIdentifier;

  rangeCardinality: CmeCardinality | null;

  externalDocumentationUrl: string | null;

  mandatoryLevel: CmeRelationshipProfileMandatoryLevel | null;

}
