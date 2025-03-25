import { NewCmeClassProfile } from "../../dataspecer/cme-model/model";
import { ClassProfileDialogState } from "./edit-class-profile-dialog-state";

export function classProfileDialogStateToNewCmeClassProfile(
  state: ClassProfileDialogState): NewCmeClassProfile {
  return {
    model: state.model.dsIdentifier,
    profileOf: state.profiles.map(item => item.identifier),
    iri: state.iri,
    name: state.name,
    nameSource: state.overrideName ? null :
      state.nameSource.identifier ?? null,
    description: state.description,
    descriptionSource: state.overrideDescription ? null :
      state.descriptionSource.identifier ?? null,
    usageNote: state.usageNote,
    usageNoteSource: state.overrideUsageNote ? null :
      state.usageNoteSource.identifier ?? null,
  }
}
