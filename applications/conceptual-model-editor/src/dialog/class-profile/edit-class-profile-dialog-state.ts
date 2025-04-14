import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import {
  type BaseEntityProfileDialogState,
  createEditBaseEntityProfileDialogState,
  createNewBaseEntityProfileDialogState,
} from "../base-entity-profile/base-entity-profile-dialog-state";
import {
  type EntityRepresentative,
  listClassToProfiles,
  representClassProfiles,
  representClassUsages,
  representUndefinedClass,
} from "../utilities/dialog-utilities";
import { EntityDsIdentifier } from "../../dataspecer/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { semanticModelMapToCmeSemanticModel } from "../../dataspecer/cme-model/adapter";
import { configuration, createLogger, t } from "../../application";
import { InvalidState } from "../../application/error";
import { isSemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { CmeSemanticModel } from "../../dataspecer/cme-model";
import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { CmeClassProfileRole } from "@/dataspecer/cme-model/model";

const LOG = createLogger(import.meta.url);

export interface ClassProfileDialogState
  extends BaseEntityProfileDialogState<EntityRepresentative> {

  availableRoles: {

    value: string;

    label: string;

    cme: CmeClassProfileRole | null;

  }[];

  role: string;

}

const ROLES = [{
  value: "undefined",
  label: "class-profile.role.undefined",
  cme: null,
}, {
  value: "main",
  label: "class-profile.role.main",
  cme: CmeClassProfileRole.Main,
}, {
  value: "supportive",
  label: "class-profile.role.supportive",
  cme: CmeClassProfileRole.Supportive,
}];

export function createNewProfileClassDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  profilesIdentifiers: EntityDsIdentifier[],
): ClassProfileDialogState {

  const allModels = semanticModelMapToCmeSemanticModel(
    graphContext.models, visualModel,
    configuration().defaultModelColor,
    identifier => t("model-service.model-label-from-id", identifier));

  const noProfile = representUndefinedClass();

  const allProfiles = listClassToProfiles(
    classesContext, graphContext, allModels);

  const allSpecializations = listClassToSpecialize(
    classesContext, graphContext, allModels);

  // EntityProfileState

  const entityProfileState = createNewBaseEntityProfileDialogState(
    language, configuration().languagePreferences, allModels,
    allProfiles, profilesIdentifiers, noProfile, allSpecializations,
    configuration().classNameToIri);

  return {
    ...entityProfileState,
    isIriAutogenerated: true,
    // Role
    availableRoles: ROLES,
    role: ROLES[0].value
  };
}

function listClassToSpecialize(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  vocabularies: CmeSemanticModel[],
): EntityRepresentative[] {
  const entities = graphContext.aggregatorView.getEntities();
  const models = [...graphContext.models.values()];

  return [
    ...representClassUsages(entities, models, vocabularies,
      classesContext.usages.filter(item => isSemanticModelClassUsage(item))),
    ...representClassProfiles(entities, models, vocabularies,
      classesContext.classProfiles),
  ];
}

/**
 * @throws InvalidState
 */
export function createEditClassProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entityIdentifier: string,
): ClassProfileDialogState {
  const entities = graphContext.aggregatorView.getEntities();

  const aggregate = entities[entityIdentifier];
  const entity = aggregate.rawEntity;
  if (entity === null || !isSemanticModelClassProfile(entity)) {
    LOG.error("Missing entity.", { aggregate });
    throw new InvalidState();
  }

  //

  const allModels = semanticModelMapToCmeSemanticModel(
    graphContext.models, visualModel,
    configuration().defaultModelColor,
    identifier => t("model-service.model-label-from-id", identifier));

  const noProfile = representUndefinedClass();

  const allProfiles = listClassToProfiles(
    classesContext, graphContext, allModels)
    .filter(item => item.identifier !== entity.id);

  const allSpecializations = listClassToSpecialize(
    classesContext, graphContext, allModels);

  // EntityProfileState

  const entityProfileState = createEditBaseEntityProfileDialogState(
    language, graphContext.models, allModels,
    { identifier: entity.id, model: model.getId() },
    allProfiles, entity.profiling, noProfile,
    entity.iri ?? "",
    entity.name, entity.nameFromProfiled,
    entity.description, entity.descriptionFromProfiled,
    entity.externalDocumentationUrl ?? "",
    entity.usageNote, entity.usageNoteFromProfiled,
    allSpecializations);

  return {
    ...entityProfileState,
    // Role
    availableRoles: ROLES,
    role: ROLES.find(item => entity.tags?.includes(item.cme ?? ""))?.value
      ?? ROLES[0].value,
  };
}
