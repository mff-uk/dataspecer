
import { VisualModel, isWritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { Options } from "../application";
import { SemanticModelRelationship, isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelRelationshipEndUsage, SemanticModelRelationshipUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
import { addSemanticClassProfileToVisualModelAction } from "./add-class-profile-to-visual-model";
import { UseDiagramType } from "../diagram/diagram-hook";
import { addSemanticRelationshipProfileToVisualModelAction } from "./add-relationship-profile-to-visual-model";
import { createNewProfileClassDialogState } from "../dialog/class-profile/create-new-class-profile-dialog-state";
import { findAnyWritableModelFromRawInput } from "../cme-model/cme-model-utilities";
import { CmeModel } from "../dataspecer/cme-model";
import { CreatedEntityOperationResult } from "@dataspecer/core-v2/semantic-model/operations";
import { EditClassProfileDialogState } from "../dialog/class-profile/edit-class-profile-dialog-controller";
import { CmeModelOperationExecutor } from "../dataspecer/cme-model/cme-model-operation-executor";

export async function createDefaultProfilesAction(
  cmeExecutor: CmeModelOperationExecutor,
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  options: Options,
  classesContext: ClassesContextType,
  visualModel: VisualModel | null,
  nodesToProfile: string[],
  edgesToProfile: string[],
  shouldBeAddedToVisualModel: boolean
): Promise<void> {
  const writableSemanticModel = findAnyWritableModelFromRawInput(graph.models, visualModel);
  if (writableSemanticModel === null) {
    notifications.error("There is no InMemorySemanticModel to put the profiles into.");
    return;
  }
  // We have to wait otherwise we might start creating relation profiles for non-existing class profiles
  const createdClassProfiles = await createDefaultClassProfiles(
    cmeExecutor, notifications, graph, diagram, options, classesContext,
    visualModel, nodesToProfile, shouldBeAddedToVisualModel);
  createDefaultRelationshipProfiles(
    notifications, graph, visualModel, writableSemanticModel, edgesToProfile,
    createdClassProfiles, shouldBeAddedToVisualModel)
};

//

/**
 * Creates classes and class profiles from given {@link nodesToProfile} containing semantic identifiers of entities to profile and adds the profiles to the visual model.
 * @returns The created map of created class and class profiles. Key is the identifier from {@link nodesToProfile} and value is the identifier of the created profile.
 * Or null, if it is explicitly null, then it means that we failed to create the class profile for some reason.
 */
async function createDefaultClassProfiles(
  cmeExecutor: CmeModelOperationExecutor,
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  options: Options,
  classesContext: ClassesContextType,
  visualModel: VisualModel | null,
  nodesToProfile: string[],
  shouldBeAddedToVisualModel: boolean
): Promise<Record<string, string | null>> {
  const createdClassProfiles: Record<string, string | null> = {};
  for (const selectedEntityId of nodesToProfile) {
    const createdClassProfile = await createDefaultClassProfile(
      cmeExecutor, notifications, graph, diagram, options, classesContext,
      visualModel, selectedEntityId, shouldBeAddedToVisualModel);
    createdClassProfiles[selectedEntityId] = createdClassProfile;
  }

  return createdClassProfiles;
}

/**
 * Creates class profile of given entity with default parameters,
 * that it is the resulting class profile is the same as if the user opened the dialog and clicked accept without changing anything.
 * @returns The identifier of the created class profile or null if the creation of profile failed
 */
async function createDefaultClassProfile(
  cmeExecutor: CmeModelOperationExecutor,
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  options: Options,
  classesContext: ClassesContextType,
  visualModel: VisualModel | null,
  entityToProfile: string,
  shouldBeAddedToVisualModel: boolean
): Promise<string | null> {
  const classOrClassProfileToBeProfiled = graph.aggregatorView.getEntities()?.[entityToProfile]?.aggregatedEntity;
  if (classOrClassProfileToBeProfiled === undefined || classOrClassProfileToBeProfiled === null) {
    notifications.error("The entity (node) to be profiled from selection is not present in aggregatorView");
    return null;
  }
  const isTheProfiledClassClassProfile = isSemanticModelClassUsage(classOrClassProfileToBeProfiled);
  const isTheProfiledClassClass = isSemanticModelClass(classOrClassProfileToBeProfiled);
  if (!isTheProfiledClassClass && !isTheProfiledClassClassProfile) {
    notifications.error("The entity to be profiled from selection is not a class or class profile");
    return null;
  }

  const profileClassState = createNewProfileClassDialogState(
    classesContext, graph, visualModel, options.language,
    [classOrClassProfileToBeProfiled.id],
  );
  const createdClassProfile = createClassProfile(profileClassState, cmeExecutor);
  if (shouldBeAddedToVisualModel) {
    if (isWritableVisualModel(visualModel)) {
      await addSemanticClassProfileToVisualModelAction(
        notifications, graph, classesContext, visualModel, diagram,
        createdClassProfile.identifier, createdClassProfile.model, null);
    }
  }

  return createdClassProfile.identifier;
}

const createClassProfile = (
  state: EditClassProfileDialogState,
  cmeExecutor: CmeModelOperationExecutor,
) => {
  return cmeExecutor.createClassProfile({
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
  });
}

function createDefaultRelationshipProfiles(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: VisualModel | null,
  writableCmeModel: CmeModel,
  edgesToProfile: string[],
  createdClassProfiles: Record<string, string | null>,
  shouldBeAddedToVisualModel: boolean
) {
  const writableSemanticModel = graph.models.get(writableCmeModel.dsIdentifier) as InMemorySemanticModel;   // Casting ... the correctness should be already validated
  for (const edgeToProfile of edgesToProfile) {
    createDefaultRelationshipProfile(
      notifications, graph, writableSemanticModel, visualModel,
      edgeToProfile, createdClassProfiles, shouldBeAddedToVisualModel);
  }
}

/**
 * Creates relationship profile of given entity with default parameters,
 * that it is the resulting relationship profile is the same as if the user opened the dialog and clicked accept without changing anything.
 */
function createDefaultRelationshipProfile(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  model: InMemorySemanticModel,
  visualModel: VisualModel | null,
  entityToProfile: string,
  createdClassProfiles: Record<string, string | null>,
  shouldBeAddedToVisualModel: boolean
) {
  const relationshipToProfile = getAndValidateRelationshipToBeProfiled(notifications, graph, entityToProfile);
  if (relationshipToProfile === null) {
    return;
  }

  const ends: SemanticModelRelationshipEndUsage[] | undefined = [];
  for (const end of relationshipToProfile.ends) {
    if (end.concept === null) {
      return;
    }
    // The creation of the class profile failed, so the created profiled association should fail as well
    if (createdClassProfiles[end.concept] === null) {
      notifications.error("Relationship is not profiled, since one of the end classes couldn't be profiled");
      return;
    }

    const newEnd: SemanticModelRelationshipEndUsage = {
      ...end,
      concept: createdClassProfiles[end.concept] ?? end.concept,
      usageNote: (end as SemanticModelRelationshipEndUsage)?.usageNote ?? null,
      cardinality: end.cardinality ?? null,
    };

    ends.push(newEnd);
  }

  let usageNote = null;
  if (isSemanticModelRelationshipUsage(relationshipToProfile)) {
    usageNote = relationshipToProfile.usageNote;
  }

  const { success, id: identifier } = model.executeOperation(createRelationshipUsage({
    usageOf: relationshipToProfile.id,
    usageNote: usageNote,
    ends: ends,
  })) as CreatedEntityOperationResult;

  if (!(identifier !== undefined && success)) {
    notifications.error("Failed while performing the actual operation of adding the relationship profile into semantic model.");
    return;
  }

  if (shouldBeAddedToVisualModel) {
    if (isWritableVisualModel(visualModel)) {
      addSemanticRelationshipProfileToVisualModelAction(notifications, graph, visualModel, identifier, model.getId());
    }
  }
}

function getAndValidateRelationshipToBeProfiled(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  entityToProfile: string
): SemanticModelRelationship | SemanticModelRelationshipUsage | null {
  const relationshipToProfile = graph.aggregatorView.getEntities()?.[entityToProfile]?.aggregatedEntity;
  if (relationshipToProfile === undefined || relationshipToProfile === null) {
    notifications.error("The entity (edge) to be profiled from selection is not present in aggregatorView");
    return null;
  }
  if (isSemanticModelClassUsage(relationshipToProfile)) {    // The visual edge representing class profile
    return null;
  }
  if (isSemanticModelGeneralization(relationshipToProfile)) {
    return null;
  }
  if (!isSemanticModelRelationship(relationshipToProfile) &&
    !isSemanticModelRelationshipUsage(relationshipToProfile)) {
    notifications.error("The entity to be profiled from selection is not a association or association profile");
    return null;
  }

  return relationshipToProfile;
}
