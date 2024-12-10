import { isWritableVisualModel, VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { createCreateProfileClassDialogState } from "../dialog/class-profile/create-class-profile-dialog-controller";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { Options } from "../application";
import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelRelationshipEndUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { createClassProfile } from "./open-create-profile-dialog";
import { findSourceModelOfEntity } from "../service/model-service";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
import { addSemanticClassProfileToVisualModelAction } from "./add-class-profile-to-visual-model";
import { UseDiagramType } from "../diagram/diagram-hook";
import { addSemanticRelationshipProfileToVisualModelAction } from "./add-relationship-profile-to-visual-model";


export function createDefaultProfilesAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  options: Options,
  classesContext: ClassesContextType,
  visualModel: VisualModel | null,
  nodesToProfile: string[],
  edgesToProfile: string[],
  shouldBeAddedToVisualModel: boolean
): void {
  const createdClassProfiles = createDefaultClassProfiles(notifications, graph, diagram, options, classesContext, visualModel, nodesToProfile, shouldBeAddedToVisualModel);
  createDefaultRelationshipProfiles(notifications, graph, visualModel, edgesToProfile, createdClassProfiles, shouldBeAddedToVisualModel)
};


//


/**
 * Creates classes and class profiles from given {@link nodesToProfile} containing semantic identifiers of entities to profile and adds the profiles to the visual model.
 * @returns The created map of created class and class profiles. Key is the identifier from {@link nodesToProfile} and value is the identifier of the created profile.
 */
function createDefaultClassProfiles(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  options: Options,
  classesContext: ClassesContextType,
  visualModel: VisualModel | null,
  nodesToProfile: string[],
  shouldBeAddedToVisualModel: boolean
): Record<string, string> {
  const createdClassProfiles: Record<string, string> = {};
  for(const selectedEntityId of nodesToProfile) {
    const createdClassProfile = createDefaultClassProfile(notifications, graph, diagram, options, classesContext, visualModel, selectedEntityId, shouldBeAddedToVisualModel);
    if(createdClassProfile !== null) {
      createdClassProfiles[selectedEntityId] = createdClassProfile;
    }
  }

  return createdClassProfiles;
}


/**
 * Creates class profile of given entity with default parameters,
 * that it is the resulting class profile is the same as if the user opened the dialog and clicked accept without changing anything.
 * @returns The identifier of the created class profile or null if the creation of profile failed
 */
function createDefaultClassProfile(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  options: Options,
  classesContext: ClassesContextType,
  visualModel: VisualModel | null,
  entityToProfile: string,
  shouldBeAddedToVisualModel: boolean
): string | null {
  const classOrClassProfileToBeProfiled = graph.aggregatorView.getEntities()?.[entityToProfile]?.aggregatedEntity;
  if(classOrClassProfileToBeProfiled === undefined || classOrClassProfileToBeProfiled === null) {
    notifications.error("The entity (node) to be profiled from selection is not present in aggregatorView");
    return null;
  }
  const isTheProfiledClassClassProfile = isSemanticModelClassUsage(classOrClassProfileToBeProfiled);
  const isTheProfiledClassClass = isSemanticModelClass(classOrClassProfileToBeProfiled);
  if(!isTheProfiledClassClass && !isTheProfiledClassClassProfile) {
    notifications.error("The entity to be profiled from selection is not a class or class profile");
    return null;
  }

  const profileClassState = createCreateProfileClassDialogState(
    classesContext,
    graph,
    visualModel,
    options.language,
    classOrClassProfileToBeProfiled,
  );
  const createdClassProfile = createClassProfile(profileClassState);
  if(createdClassProfile === null) {
    notifications.error("Failed while performing the actual operation of adding the class profile into semantic model.");
    return null;
  }

  if(shouldBeAddedToVisualModel) {
    if(isWritableVisualModel(visualModel)) {
      addSemanticClassProfileToVisualModelAction(notifications, graph, visualModel, diagram, createdClassProfile.identifier, createdClassProfile.model.getId(), null);
    }
  }

  return createdClassProfile.identifier;
}


//
//


function createDefaultRelationshipProfiles(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: VisualModel | null,
  edgesToProfile: string[],
  createdClassProfiles: Record<string, string>,
  shouldBeAddedToVisualModel: boolean
) {
  for(const selectedEntityId of edgesToProfile) {
    createDefaultRelationshipProfile(notifications, graph, visualModel, selectedEntityId, createdClassProfiles, shouldBeAddedToVisualModel);
  }
}


/**
 * Creates relationship profile of given entity with default parameters,
 * that it is the resulting relationship profile is the same as if the user opened the dialog and clicked accept without changing anything.
 */
function createDefaultRelationshipProfile(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: VisualModel | null,
  entityToProfile: string,
  createdClassProfiles: Record<string, string>,
  shouldBeAddedToVisualModel: boolean
) {
  const validatedData = getAndValidateRelationshipOrRelationshipProfileToBeProfiled(notifications, graph, entityToProfile);
  if(validatedData === null) {
    return;
  }
  const {relationshipOrRelationshipProfileToBeProfiled, model} = validatedData;

  const ends: SemanticModelRelationshipEndUsage[] | undefined = [];
  for (const end of relationshipOrRelationshipProfileToBeProfiled.ends) {
    if(end.concept === null) {
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
  if(isSemanticModelRelationshipUsage(relationshipOrRelationshipProfileToBeProfiled)) {
    usageNote = relationshipOrRelationshipProfileToBeProfiled.usageNote;
  }

  const { success, id: identifier } = model.executeOperation(createRelationshipUsage({
    usageOf: relationshipOrRelationshipProfileToBeProfiled.id,
    usageNote: usageNote,
    ends: ends,
  }));

  if (!(identifier !== undefined && success)) {
    notifications.error("Failed while performing the actual operation of adding the relationship profile into semantic model.");
    return;
  }

  if(shouldBeAddedToVisualModel) {
    if(isWritableVisualModel(visualModel)) {
      addSemanticRelationshipProfileToVisualModelAction(notifications, graph, visualModel, identifier, model.getId());
    }
  }
}


function getAndValidateRelationshipOrRelationshipProfileToBeProfiled(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  entityToProfile: string
): {
  relationshipOrRelationshipProfileToBeProfiled: SemanticModelRelationship | SemanticModelRelationshipUsage,
  model: InMemorySemanticModel
} | null {
  const relationshipOrRelationshipProfileToBeProfiled = graph.aggregatorView.getEntities()?.[entityToProfile]?.aggregatedEntity;
  if(relationshipOrRelationshipProfileToBeProfiled === undefined || relationshipOrRelationshipProfileToBeProfiled === null) {
    notifications.error("The entity (edge) to be profiled from selection is not present in aggregatorView");
    return null;
  }
  if(isSemanticModelClassUsage(relationshipOrRelationshipProfileToBeProfiled)) {    // The visual edge representing class profile
    return null;
  }
  if(isSemanticModelGeneralization(relationshipOrRelationshipProfileToBeProfiled)) {
    return null;
  }
  if(!isSemanticModelRelationship(relationshipOrRelationshipProfileToBeProfiled) && !isSemanticModelRelationshipUsage(relationshipOrRelationshipProfileToBeProfiled)) {
    notifications.error("The entity to be profiled from selection is not a association or association profile");
    return null;
  }

  const model = findSourceModelOfEntity(relationshipOrRelationshipProfileToBeProfiled.id, graph.models);
  if (model === null) {
    notifications.error(`Can not find model for '${relationshipOrRelationshipProfileToBeProfiled.id}'.`);
    return null;
  }
  if (!(model instanceof InMemorySemanticModel)) {
    notifications.error(`Model for '${relationshipOrRelationshipProfileToBeProfiled.id} is not semantic'.`);
    return null;
  }

  return {relationshipOrRelationshipProfileToBeProfiled, model};
}