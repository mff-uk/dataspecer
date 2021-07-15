import {CoreEvent} from "../core-event";
import {PsmAssociationEnd} from "../../model"

export class PsmCreateAssociationEnd extends CoreEvent {

  psmOwnerClass: string;

  psmAssociationEnd: PsmAssociationEnd;

}
