import { LanguageString } from "@dataspecer/core/core/core-resource";
import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";

export interface NewCmeClass {

  model: ModelDsIdentifier;

  iri: string | null;

  name: LanguageString | null;

  description: LanguageString | null;

}

export interface CmeClass extends NewCmeClass {

  identifier: EntityDsIdentifier;

}
