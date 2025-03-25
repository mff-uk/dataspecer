import { NewCmeClass } from "../../dataspecer/cme-model/model";
import { ClassDialogState } from "./edit-class-dialog-state";

export function classDialogStateToNewCmeClass(
  state: ClassDialogState): NewCmeClass {
  return {
    model: state.model.dsIdentifier,
    name: state.name,
    description: state.description,
    iri: state.iri,

  }
}
