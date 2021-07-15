import {CoreEvent} from "../core-event";
import {PimAssociation} from "../../model"

export class PimCreateAssociation extends CoreEvent {

  pimOwnerClass: string;

  pimAssociation: PimAssociation;

}
