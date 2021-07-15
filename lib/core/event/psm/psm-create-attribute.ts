import {CoreEvent} from "../core-event";
import {PsmAttribute} from "../../model"

export class PsmCreateAttribute extends CoreEvent {

  psmOwnerClass: string;

  psmAttribute: PsmAttribute;

}
