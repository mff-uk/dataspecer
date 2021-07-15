import {CoreEvent} from "../core-event";
import {PimAttribute} from "../../model"

export class PimCreateAttribute extends CoreEvent {

  pimOwnerClass: string;

  pimAttribute: PimAttribute;

}
