import { LanguageString, EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";

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
