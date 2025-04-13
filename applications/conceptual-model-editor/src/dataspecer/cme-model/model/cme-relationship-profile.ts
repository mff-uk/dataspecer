import { LanguageString } from "@dataspecer/core/core/core-resource";
import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { CmeCardinality } from "./cme-cardinality";
import { CmeRelationshipProfileMandatoryLevel } from "./cme-well-known";

export interface NewCmeRelationshipProfile {

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

export interface CmeRelationshipProfile extends NewCmeRelationshipProfile {

  identifier: EntityDsIdentifier;

}
