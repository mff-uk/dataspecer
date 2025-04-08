import { LanguageString } from "@dataspecer/core/core/core-resource";
import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { ClassRole } from "./cme-well-known";

export interface NewCmeClass {

  model: ModelDsIdentifier;

  iri: string | null;

  name: LanguageString | null;

  description: LanguageString | null;

  role: ClassRole;

}

export interface CmeClass extends NewCmeClass {

  identifier: EntityDsIdentifier;

}
