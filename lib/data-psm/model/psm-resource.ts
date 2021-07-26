import {CoreResource, LanguageString} from "../core-resource";

export class PsmResource extends CoreResource {

  psmInterpretation?: string;

  psmTechnicalLabel?: string;

  psmHumanLabel?: LanguageString;

  psmHumanDescription?: LanguageString;

}
