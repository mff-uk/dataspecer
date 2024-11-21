import { useMemo } from "react";

import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isSemanticModelClassUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { type DialogProps } from "../dialog-api";
import { generateName } from "../../util/name-utils";
import { getModelIri } from "../../util/iri-utils";
import { configuration } from "../../application";
import { ModelGraphContextType } from "../../context/model-context";
import { representClasses, representModels, selectWritableModels, sortRepresentatives, representClassProfiles } from "../utilities/dialog-utilities";
import { ClassesContextType } from "../../context/classes-context";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";
import { createCreateEntityController, createEntityController, CreateEntityState, CreateEntityStateController, EntityState, EntityStateController, isRelativeIri } from "../utilities/entity-utilities";
import { createProfileController, ProfileState, ProfileStateController } from "../utilities/profile-utilities";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";

export interface CreateClassProfileDialogState extends EntityState, CreateEntityState, ProfileState {

  language: string;

  overrideName: boolean;

  overrideDescription: boolean;

}

export function createCreateProfileClassDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entity: SemanticModelClass | SemanticModelClassUsage,
): CreateClassProfileDialogState {
  const models = [...graphContext.models.values()];
  const availableModels = representModels(visualModel, models);
  const writableModels = representModels(visualModel, selectWritableModels(models));
  const representedModel = representModels(visualModel, [model])[0];

  const entities = graphContext.aggregatorView.getEntities();

  // Prepare list of class and class profiles we can profile.
  const availableProfiles = sanitizeDuplicitiesInRepresentativeLabels(availableModels, [
    ...representClasses(models, classesContext.classes),
    ...representClassProfiles(entities, models,
      classesContext.profiles.filter(item => isSemanticModelClassUsage(item))),
  ]);
  sortRepresentatives(language, availableProfiles);

  // Find representation of entity to profile.
  const profileOf =
    availableProfiles.find(item => item.identifier === entity.id)
    ?? availableProfiles[0]
    ?? null;

  if (profileOf === null) {
    // TODO: What should we do here?
    throw Error("Can not create dialog.");
  }

  // Rest of this function depends of what we are profiling.
  const isProfilingProfile = profileOf.profileOfIdentifiers.length > 0;
  if (isProfilingProfile) {
    // We are profiling a profile, we need to get the effective values.
    const aggregated = entities[entity.id]?.aggregatedEntity;
    if (!isSemanticModelClassUsage(aggregated)) {
      // TODO: What should we do here?
      throw Error("Can not create dialog.");
    }

    return {
      language,
      availableModels,
      writableModels,
      model: representedModel,
      iri: entity.iri ?? "",
      iriPrefix: getModelIri(model),
      isIriAutogenerated: false,
      isIriRelative: isRelativeIri(entity.iri),
      name: aggregated.name ?? {},
      overrideName: false,
      description: aggregated.description ?? {},
      overrideDescription: false,
      availableProfiles,
      profileOf,
      usageNote: aggregated.usageNote ?? {},
      overrideUsageNote: false,
      disableOverrideUsageNote: false,
    }
  } else {
    // We profile a class, we can load the values directly.
    return {
      language,
      availableModels,
      writableModels,
      model: representedModel,
      iri: entity.iri ?? "",
      iriPrefix: getModelIri(model),
      isIriAutogenerated: false,
      isIriRelative: isRelativeIri(entity.iri),
      name: entity.name ?? {},
      overrideName: false,
      description: entity.description ?? {},
      overrideDescription: false,
      availableProfiles,
      profileOf,
      usageNote: {},
      overrideUsageNote: true,
      disableOverrideUsageNote: true,
    }
  }
}

export interface CreateClassProfileDialogController extends EntityStateController, CreateEntityStateController, ProfileStateController {

  toggleNameOverride: () => void;

  toggleDescriptionOverride: () => void;

}

export function useCreateClassProfileDialogController({ changeState }: DialogProps<CreateClassProfileDialogState>): CreateClassProfileDialogController {

  return useMemo(() => {

    const entityController = createEntityController(changeState);

    const newEntityController = createCreateEntityController(
      changeState, entityController, configuration().nameToClassIri);

    const profileController = createProfileController(changeState);

    const toggleNameOverride = () => {
      changeState((state) => ({ ...state, overrideName: !state.overrideName }));
    };

    const toggleDescriptionOverride = () => {
      changeState((state) => ({ ...state, overrideDescription: !state.overrideDescription }));
    };


    return {
      ...entityController,
      ...profileController,
      ...newEntityController,
      toggleNameOverride,
      toggleDescriptionOverride,
    };
  }, [changeState]);
}
