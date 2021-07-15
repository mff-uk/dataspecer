import {CoreEvent} from "../core-event";
import {PimAssociationEnd} from "../../model"

export class PimCreateAssociationEnd extends CoreEvent {

  pimOwnerClass: string;

  pimAssociationEnd: PimAssociationEnd;

}
