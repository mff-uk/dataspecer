import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { DataTypeRepresentative, RelationshipRepresentative } from "../utilities/dialog-utilities";
import { EntityProfileState, EntityProfileStateController, createEntityProfileController } from "../utilities/entity-profile-utilities";
import { RelationshipProfileState, RelationshipProfileStateController, createRelationshipProfileController } from "../utilities/relationship-profile-utilities";

export interface EditAttributeProfileDialogState extends EntityProfileState<RelationshipRepresentative>, RelationshipProfileState<DataTypeRepresentative> {

  enableProfilChange: boolean;

}

export interface EditAttributeProfileDialogController extends EntityProfileStateController, RelationshipProfileStateController<DataTypeRepresentative> {

  onChangeProfile: (next: RelationshipRepresentative) => void;

}

export function useEditAttributeProfileDialogController({ changeState }: DialogProps<EditAttributeProfileDialogState>): EditAttributeProfileDialogController {

  return useMemo(() => {

    const entityProfileController = createEntityProfileController(changeState, configuration().nameToIri);

    const relationshipProfileController = createRelationshipProfileController(changeState);

    const onChangeProfile = (next: RelationshipRepresentative): void => {
      changeState(prev => {
        const result = {
          ...prev,
          profileOf: next,
        };

        // We need to update the inherited values.
        if (!prev.overrideName) {
          result.name = next.label;
        }
        if (!prev.overrideDescription) {
          result.description = next.description;
        }
        if (!prev.overrideDomainCardinality) {
          result.domainCardinality = next.domainCardinality;
        }
        if (!prev.overrideRange) {
          result.range =
            prev.availableRangeItems.find(item => item.identifier === next.range)
            ?? prev.availableRangeItems[0];
        }
        if (!prev.overrideRangeCardinality) {
          result.rangeCardinality = next.rangeCardinality;
        }

        // Usage note is a little bit more complicated.
        if (next.profileOfIdentifiers.length === 0) {
          // We profile an attribute, user should provide a usage note,
          // there is nothing to inherit from.
          result.overrideUsageNote = true;
          result.disableOverrideUsageNote = true;
        } else {
          // We profile an attribute profile, we let user decide whether
          // to profile or not.
          result.disableOverrideUsageNote = false;
        }
        return result;
      });
    };

    return {
      ...entityProfileController,
      ...relationshipProfileController,
      onChangeProfile
    };
  }, [changeState]);
}
