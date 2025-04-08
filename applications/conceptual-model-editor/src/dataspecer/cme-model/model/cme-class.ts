import { LanguageString } from "@dataspecer/core/core/core-resource";
import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { CmeClassProfileRole } from "./cme-well-known";

export interface NewCmeClass {

  model: ModelDsIdentifier;

  iri: string | null;

  name: LanguageString | null;

  description: LanguageString | null;

  externalDocumentationUrl: string | null;

}

export interface CmeClass extends NewCmeClass {

  identifier: EntityDsIdentifier;

}
