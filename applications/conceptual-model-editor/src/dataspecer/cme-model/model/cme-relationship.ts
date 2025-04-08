import { LanguageString } from "@dataspecer/core/core/core-resource";
import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { CmeCardinality } from "./cme-cardinality";
import { MandatoryLevel } from "./cme-well-known";

export interface NewCmeRelationship {

  model: ModelDsIdentifier;

  iri: string | null;

  name: LanguageString;

  description: LanguageString;

  domain: EntityDsIdentifier | null;

  domainCardinality: CmeCardinality | null;

  range: EntityDsIdentifier | null;

  rangeCardinality: CmeCardinality | null;

  mandatoryLevel: MandatoryLevel;

}

export interface CmeRelationship extends NewCmeRelationship {

  identifier: EntityDsIdentifier;

}
