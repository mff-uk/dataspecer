import {CoreEvent} from "../core-event";
import {LanguageString} from "../../model/core-resource";

export class PsmUpdateHumanLabel extends CoreEvent {

  psmResource: string;

  psmHumanDescription: LanguageString;

}
