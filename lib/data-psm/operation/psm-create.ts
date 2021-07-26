import {LanguageString} from "../../model";
import {CoreAction} from "../core-action";

export class PimCreate extends CoreAction {

  psmInterpretation?: string;

  psmTechnicalLabel?: string;

  psmHumanLabel?: LanguageString

  psmHumanDescription?: LanguageString;

}
