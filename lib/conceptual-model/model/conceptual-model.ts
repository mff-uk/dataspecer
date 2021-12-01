import {ConceptualModelClass} from "./conceptual-model-class";
import {LanguageString} from "../../core";


export class ConceptualModel {

  pimIri: string | null = null;

  humanLabel: LanguageString | null = null;

  humanDescription: LanguageString | null = null;

  classes: { [iri: string]: ConceptualModelClass } = {};

}
