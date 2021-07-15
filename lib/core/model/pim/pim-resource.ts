import {CoreResource, LanguageString} from "../core-resource";

export class PimResource extends CoreResource {

  pimInterpretation?: string;

  pimTechnicalLabel?: string;

  pimHumanLabel?: LanguageString;

  pimHumanDescription?: LanguageString;

}
