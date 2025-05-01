import { NewCmeRelationshipProfile } from "../../dataspecer/cme-model/model";
import { AssociationProfileDialogState } from "./edit-association-profile-dialog-state";

export function associationProfileDialogStateToNewCmeRelationshipProfile(
  state: AssociationProfileDialogState
): NewCmeRelationshipProfile {
  return associationProfileDialogStateToNewCmeRelationshipProfileWithOverridenEnds(
    state, state.domain.identifier, state.range.identifier);
}

export function associationProfileDialogStateToNewCmeRelationshipProfileWithOverridenEnds(
  state: AssociationProfileDialogState,
  domain: string,
  range: string,
): NewCmeRelationshipProfile {
  return {
    model: state.model.identifier,
    profileOf: state.profiles.map(item => item.identifier),
    name: state.name,
    nameSource: state.overrideName ? null :
      state.nameSource.identifier ?? null,
    description: state.description,
    descriptionSource: state.overrideDescription ? null :
      state.descriptionSource.identifier ?? null,
    iri: state.iri,
    usageNote: state.usageNote,
    usageNoteSource: state.overrideUsageNote ? null :
      state.usageNoteSource.identifier ?? null,
    //
    domain: domain,
    domainCardinality:
      state.overrideDomainCardinality ?
        state.domainCardinality.cardinality : null,
    range: range,
    rangeCardinality:
      state.overrideRangeCardinality ?
        state.rangeCardinality.cardinality : null,
    //
    externalDocumentationUrl: state.externalDocumentationUrl,
    mandatoryLevel: state.availableMandatoryLevels.find(
      item => item.value === state.mandatoryLevel)?.cme ?? null,
  }
}
