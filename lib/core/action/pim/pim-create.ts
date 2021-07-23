import {LanguageString} from "../../model";
import {CoreAction} from "../core-action";

export class PimCreate extends CoreAction {

  pimInterpretation?: string;

  pimTechnicalLabel?: string;

  pimHumanLabel?: LanguageString

  pimHumanDescription?: LanguageString;

}
