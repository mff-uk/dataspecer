import { ConceptualModelProperty } from "./conceptual-model-property";
import { LanguageString } from "../../core";

export class ConceptualModelClass {
  pimIri: string | null = null;

  cimIri: string | null = null;

  humanLabel: LanguageString | null = null;

  humanDescription: LanguageString | null = null;

  isCodelist = false;

  codelistUrl: string[] = [];

  extends: ConceptualModelClass[] = [];

  properties: ConceptualModelProperty[] = [];
}
