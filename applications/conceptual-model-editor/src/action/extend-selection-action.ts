import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { sourceModelOfEntity } from "../util/model-utils";
import { Entity, EntityModel } from "@dataspecer/core-v2";
import { SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship, isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { VisualEntity, VisualModel, isVisualNode, isVisualProfileRelationship, isVisualRelationship } from "@dataspecer/core-v2/visual-model";
import { Selections } from "./filter-selection-action";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

export type ClassesContextEntities = {
    classes: SemanticModelClass[],
    relationships: SemanticModelRelationship[],
    generalizations: SemanticModelGeneralization[],
    profiles: (SemanticModelClassUsage | SemanticModelRelationshipUsage)[],
    rawEntities: (Entity | null)[],
};

/**
 * Type representing all the possible extensions of the selection.
 */
export enum ExtensionType {
    ASSOCIATION,
    ASSOCIATION_SOURCE,
    ASSOCIATION_TARGET,

    GENERALIZATION,
    GENERALIZATION_PARENT,
    GENERALIZATION_CHILD,

    PROFILE_EDGE,
    PROFILE_EDGE_SOURCE,
    PROFILE_EDGE_TARGET,

    PROFILE_CLASS,
    PROFILE_CLASS_PARENT,
    PROFILE_CLASS_CHILD
};

/**
 * Type representing additional visibility filter on the result. The visibility filter is almost always applied to both nodes and edges.
 * Only in the ONLY_VISIBLE_NODES option, the visibility of edges is ignored - This option is used fror example when we want to find edge of to be added node
 */
export enum VisibilityFilter {
    ONLY_VISIBLE,
    ONLY_NON_VISIBLE,
    ALL,
    ONLY_VISIBLE_NODES
};

type SelectionExtension = {
    selectionExtension: Selections,
    /**
     * By which edges was the node added to the extension. So identifier of the node is the key and identifiers of the corresponding edges are in the value.
     */
    nodesToEdgesMapping: Record<string, string[]>,
}

/**
 * @param usingSemanticIdentifiers If set to true, we also check all classes and class profiles in {@link contextEntities}
 * (if the {@link contextEntities} are null then the check is skipped), if the semantic entity represented by {@link classId} is part of it.
 * (if set to false, then we don't check because we expect that since we know the visual entity, we already checked that the semantic exists).
 * We do that to filter out things like owl:Thing which are not part of the model.
 */
const addToSelectionExtension = (
  selectionExtensionToExtend: SelectionExtension,
  classId: string,
  edgeWhichAddedClass: EdgeWhichAddedClass,
  usingSemanticIdentifiers: boolean,
  contextEntities: ClassesContextEntities | null
) => {
  const nodeSelection = selectionExtensionToExtend.selectionExtension.nodeSelection;
  if(nodeSelection.includes(classId)) {
    return;
  }
  if(usingSemanticIdentifiers && contextEntities !== null) {
    const existsInEntities = contextEntities.classes.find(classEntity => classEntity.id === classId) !== undefined ||
            contextEntities.profiles.find(profile => profile.id === classId && isSemanticModelClassUsage(profile)) !== undefined
    if(!existsInEntities) {
      return;
    }
  }
  nodeSelection.push(classId);
  if(isEdgeWhichAddedClassNotClassProfileEdge(edgeWhichAddedClass)) {
    selectionExtensionToExtend.selectionExtension.edgeSelection.push(edgeWhichAddedClass);
    if(selectionExtensionToExtend.nodesToEdgesMapping[classId] === undefined) {
      selectionExtensionToExtend.nodesToEdgesMapping[classId] = [];
    }
    selectionExtensionToExtend.nodesToEdgesMapping[classId].push(edgeWhichAddedClass);
  }
}

const createEmptySelectionExtension = (): SelectionExtension => {
  return {
    selectionExtension: {
      nodeSelection: [],
      edgeSelection: [],
    },
    nodesToEdgesMapping: {},
  };
}

export type NodeSelection = {
    identifiers: string[],
    areIdentifiersFromVisualModel: boolean,
};

/**
 * Implementation note: Even when we get visual ids on input, we are working with the semantic ones,
 * We get the correct form of id right at the end of the process, which is in the
 * {@link addToExtensionIfSatisfiesVisibilityFilter} method.
 * @param shouldExpandExternalModels If set to true, then allow the extension to go through external models -
 * meaning through elements which are not expanded. If set to false then don't allow.
 * Also If set to false, then this method this method is synchronous!!!
 * @param semanticModelFilter Null if all models should be considered, otherwise record with modelID as key and
 * true as value if the model should be considered, false if it shouldn't be.
 * Models which are not part of the semanticModelFilter, are by default not considered.
 * @param classesContext
 * @param graph
 * @returns Promise which contains the result after performing the extension corresponding to given arguments. The result Contains only the extension!
 * The removal of duplicities and concat with the selection given on input is on the caller of the method.
 * It is promise, because we allow to select classes which are in the external semantic model (SGOV) and not part of current model expansion.
 * But this use-case is not accessible to user from editor, it is only accessible for internal usage in cme codebase, if {@link shouldExpandExternalModels} is set to true.
 * The returned identifiers are of semantic entities. Only case when identifiers of visual entities are returned is when the property areIdentifiersFromVisualModel on {@link nodeSelection} equals true
 * AND the visibility filter is set to "ONLY-VISIBLE" (it doesn't make sense otherwise, because in such case we are referencing entities which are not part of the visual model)
 */
export const extendSelectionAction = async (
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  classesContext: ClassesContextType | null,
  nodeSelection: NodeSelection,
  extensionTypes: ExtensionType[],
  visibilityFilter: VisibilityFilter,
  shouldExpandExternalModels: boolean,
  semanticModelFilter: Record<string, boolean> | null
): Promise<SelectionExtension> => {
  if(classesContext === null) {
    notifications.error("Classes context is null");
    return createEmptySelectionExtension();
  }

  const entities: ClassesContextEntities = JSON.parse(JSON.stringify(classesContext));
  const visualModel = graph.aggregatorView.getActiveVisualModel();

  if(visualModel === null && nodeSelection.areIdentifiersFromVisualModel) {
    notifications.error("The identifiers are from visual model, but the visual model is null");
    return createEmptySelectionExtension();
  }

  let relevantExternalModels;
  if(!shouldExpandExternalModels) {
    relevantExternalModels = null;
  }
  else {
    if(semanticModelFilter === null) {
      semanticModelFilter = {};
      for(const [modelId, _] of graph.models) {
        semanticModelFilter[modelId] = true;
      }
    }
    relevantExternalModels = getRelevantExternalModelsForExtension(semanticModelFilter, graph.models);
  }
  const selectionExtension: SelectionExtension = createEmptySelectionExtension();

  for(const extensionType of extensionTypes) {
    switch(extensionType) {
    case ExtensionType.ASSOCIATION:
      await extendThroughAssociationSources(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      await extendThroughAssociationTargets(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.ASSOCIATION_TARGET:
      await extendThroughAssociationTargets(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.ASSOCIATION_SOURCE:
      await extendThroughAssociationSources(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.PROFILE_EDGE:
      await extendThroughProfileEdgeSources(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      await extendThroughProfileEdgeTargets(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.PROFILE_EDGE_SOURCE:
      await extendThroughProfileEdgeSources(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.PROFILE_EDGE_TARGET:
      await extendThroughProfileEdgeTargets(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.GENERALIZATION:
      await extendThroughGeneralizationParents(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      await extendThroughGeneralizationChildren(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.GENERALIZATION_CHILD:
      await extendThroughGeneralizationChildren(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.GENERALIZATION_PARENT:
      await extendThroughGeneralizationParents(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.PROFILE_CLASS:
      await extendThroughClassProfileParents(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      await extendThroughClassProfileChildren(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.PROFILE_CLASS_PARENT:
      await extendThroughClassProfileParents(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    case ExtensionType.PROFILE_CLASS_CHILD:
      await extendThroughClassProfileChildren(nodeSelection, visibilityFilter, selectionExtension, relevantExternalModels, entities, visualModel);
      break;
    }
  }

  if(semanticModelFilter === null) {
    return selectionExtension;
  }
  return filterExtensionUsingSemanticModelFilters(selectionExtension, semanticModelFilter, graph.models);
};

/**
 * @returns All the External Semantic Models (SGOV) from the given semantic ones
 */
const getRelevantExternalModelsForExtension = (
  semanticModelFilter: Record<string, boolean>,
  models: Map<string, EntityModel>
): ExternalSemanticModel[] => {
  return getRelevantModelsForExtension(semanticModelFilter, models).filter(model => model instanceof ExternalSemanticModel);
};

/**
 * @returns All the models which should be considered (the value in map is set to True)
 */
const getRelevantModelsForExtension = (
  semanticModelFilter: Record<string, boolean>,
  models: Map<string, EntityModel>
): EntityModel[] => {
  const relevantModels = Object.entries(semanticModelFilter).map(([modelId, isConsidered]) => {
    if(isConsidered) {
      return models.get(modelId);
    }
    else {
      return null;
    }
  }).filter(model => model !== null && model !== undefined);

  return relevantModels;
};

function filterExtensionUsingSemanticModelFilters(
  extension: SelectionExtension,
  semanticModelFilter: Record<string, boolean>,
  models: Map<string, EntityModel>
): SelectionExtension {
  const relevantModels = getRelevantModelsForExtension(semanticModelFilter, models);
  extension.selectionExtension.nodeSelection.map(extendedClassId => {
    if(sourceModelOfEntity(extendedClassId, relevantModels) === undefined) {
      for (const edgeIdentifier of extension.nodesToEdgesMapping[extendedClassId]) {
        const index = extension.selectionExtension.edgeSelection.findIndex(id => id === edgeIdentifier);
        extension.selectionExtension.edgeSelection.splice(index, 1);
      }
      delete extension.nodesToEdgesMapping[extendedClassId];
      return null;
    }
    else {
      return extendedClassId;
    }
  }).filter(id => id !== null);

  return extension;
}

//
//

/**
 * @returns Returns true if given {@link entityId} can be found in given {@link visualModel}. False otherwise.
 */
export function isEntityInVisualModel(
  visualModel: VisualModel,
  entityId: string,
  isEntityIdVisualId: boolean,
): boolean {
  let visualEntity: VisualEntity | null;
  if(isEntityIdVisualId) {
    visualEntity = visualModel.getVisualEntity(entityId);
  }
  else {
    visualEntity = visualModel.getVisualEntityForRepresented(entityId);
  }
  const isInVisualModel = visualEntity !== null;
  return isInVisualModel;
}

type SourceOrTarget = "SOURCE" | "TARGET";
type AssociationType = "CLASSIC" | "PROFILE-EDGE";

const getTheOtherEndForSTType = (end: SourceOrTarget): SourceOrTarget => {
  return end === "SOURCE" ? "TARGET" : "SOURCE";
};

const convertSTTypeToEndIndex = (end: SourceOrTarget): 0 | 1 => {
  if(end === "SOURCE") {
    return 0;
  }

  return 1;
};

enum SpecialEdge {
    FROM_CLASS_PROFILE_TO_PROFILED_CLASS,
    FROM_PROFILED_CLASS_TO_CLASS_PROFILE,
};

// At first we just used string | "FROM_CLASS_PROFILE_TO_PROFILED_CLASS" | "FROM_PROFILED_CLASS_TO_CLASS_PROFILE"
// but it was all string, so actually you could easily make mistake, since IDE wasn't autocompleting correctly
// On other side the enum also isn't perfect, we have to recase to string even we know what the given value is string.
type EdgeWhichAddedClass = string | SpecialEdge;

function isEdgeWhichAddedClassNotClassProfileEdge(edgeWhichAddedClass: EdgeWhichAddedClass): edgeWhichAddedClass is string {
  return typeof edgeWhichAddedClass === "string";
}

/**
 * Adds {@link classIdToAdd} to {@link extension} if it passes the {@link visibilityFilter}.
 */
function addToExtensionIfSatisfiesVisibilityFilter(
  extension: SelectionExtension,
  visibilityFilter: VisibilityFilter,
  classIdToAdd: string,
  edgeWhichAddedClass: EdgeWhichAddedClass,
  visualModel: VisualModel | null,
  extendedNode: string,
  isExtendedNodeVisualId: boolean,
  contextEntities: ClassesContextEntities | null,
): void {
  if(visibilityFilter === VisibilityFilter.ALL) {
    addToSelectionExtension(extension, classIdToAdd, edgeWhichAddedClass, true, contextEntities);
    return;
  }

  if(visualModel === null) {
    if(visibilityFilter === VisibilityFilter.ONLY_NON_VISIBLE) {
      addToSelectionExtension(extension, classIdToAdd, edgeWhichAddedClass, true, contextEntities);
    }
    return;
  }

  // TODO: If in future there will be multiple visual entities per one semantic, this is the only place that needs to be changed
  //              (meaning from here to the end of method and the isEntityInVisualModel method) -
  //              you need to add only the visual entities, where the identifier (from visual model) of the extended node is either a source or a target
  const isClassInVisualModel = isEntityInVisualModel(visualModel, classIdToAdd, false);
  const isProfileClassEdge = !isEdgeWhichAddedClassNotClassProfileEdge(edgeWhichAddedClass);
  let isEdgeInVisualModel = false;
  if(isProfileClassEdge) {
    if(visualModel === null || visibilityFilter !== VisibilityFilter.ONLY_VISIBLE || !isExtendedNodeVisualId) {
      isEdgeInVisualModel = true;
    }
    else {
      const visualEntities = visualModel.getVisualEntities();
      for(const [_visualEntityId, visualEntity] of visualEntities) {
        if(isVisualProfileRelationship(visualEntity)) {
          const visualSource = visualModel.getVisualEntity(visualEntity.visualSource);
          const visualTarget = visualModel.getVisualEntity(visualEntity.visualTarget);
          if(visualSource === null || !isVisualNode(visualSource) || visualTarget === null || !isVisualNode(visualTarget)) {
            // TODO RadStr: Maybe should throw error, since this shouldn't happen
            return;
          }
          const ends = edgeWhichAddedClass === SpecialEdge.FROM_CLASS_PROFILE_TO_PROFILED_CLASS ? [visualSource, visualTarget] : [visualTarget, visualSource];
          if(ends[0].identifier === extendedNode && ends[1].representedEntity === classIdToAdd) {
            isEdgeInVisualModel = true;
            edgeWhichAddedClass = visualEntity.identifier;
            break;
          }
        }
      }
    }
  }
  else {
    // We know that it is string
    isEdgeInVisualModel = isEntityInVisualModel(visualModel, edgeWhichAddedClass as string, false);
  }

  if((visibilityFilter === VisibilityFilter.ONLY_VISIBLE && isClassInVisualModel && isEdgeInVisualModel) ||
        (visibilityFilter === VisibilityFilter.ONLY_VISIBLE_NODES && isClassInVisualModel)) {
    if(isExtendedNodeVisualId && visibilityFilter === VisibilityFilter.ONLY_VISIBLE) {     // Then we want visual IDs
      const classToAddVisualEntity = visualModel.getVisualEntityForRepresented(classIdToAdd);
      let edgeWhichAddedClassVisualEntity;
      if(isProfileClassEdge) {
        // We know that it is string, because we have explicitly set it above
        edgeWhichAddedClassVisualEntity = visualModel.getVisualEntity(edgeWhichAddedClass as string);
      }
      else {
        // Must be string representing id
        edgeWhichAddedClassVisualEntity = visualModel.getVisualEntityForRepresented(edgeWhichAddedClass as string);
      }

      if(classToAddVisualEntity === null || edgeWhichAddedClassVisualEntity === null) {
        // Shouldn't happen
        console.warn("Entities which should be part of visual model are not");
        return;
      }
      addToSelectionExtension(extension, classToAddVisualEntity.identifier, edgeWhichAddedClassVisualEntity.identifier, false, null);
    }
    else {          // We want semantic IDs
      addToSelectionExtension(extension, classIdToAdd, edgeWhichAddedClass, true, contextEntities);
    }
  }
  else if(visibilityFilter === VisibilityFilter.ONLY_NON_VISIBLE && !isClassInVisualModel) {     // Not sure about the semantics of the filters for edges,
    addToSelectionExtension(extension, classIdToAdd, edgeWhichAddedClass, true, contextEntities);      // So we just check the visibility of the class
  }
}

/**
 * This method goes through all the {@link relevantExternalModel} and checks if {@link selectedClassId} is in any of those. If it is then we allow surroundings of the class.
 * @returns Promise with either null if the selected class isn't part of any of the {@link relevantExternalModel}, otherwise promise with external model where it lies.
 */
async function allowSurroundingsInExternalModels(
  selectedClassId: string,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visibilityFilter: VisibilityFilter
): Promise<ExternalSemanticModel | null> {
  if(relevantExternalModels === null || visibilityFilter === VisibilityFilter.ONLY_VISIBLE || visibilityFilter === VisibilityFilter.ONLY_VISIBLE_NODES) {
    return null;
  }

  const externalModelWhereSelectedClassResides = sourceModelOfEntity(selectedClassId, relevantExternalModels) as ExternalSemanticModel;
  if(externalModelWhereSelectedClassResides !== undefined) {
    await externalModelWhereSelectedClassResides.allowClassSurroundings(selectedClassId);
    extendEntityArraysBasedOnExternalAllowanceOfSurroundings(externalModelWhereSelectedClassResides, contextEntities);
    return externalModelWhereSelectedClassResides;
  }

  return null;
}

/**
 * In cases where the given class or class profile misses. We try to look for it in {@link relevantExternalModels},
 * but we don't know where it resides, so so we have to try to expand every model.
 *
 *
 * Note: Once we expand we can't unexpand though, but that is how it is designed even for the search bar.
 *
 *
 * If the {@link classIdentifier} can't be found in list of all entities, then try to allow it in all of the given {@link relevantExternalModels}.
 * If we actually do find the {@link classIdentifier} in {@link relevantExternalModels} then we extend the given {@link contextEntities}.
 * @returns False if it can be found in list of all entities, true otherwise (so we TRIED to perform expansion, but we are not actually saying that we found something).
 */
async function tryAllowClassInExternalModelsIfNotFound(
  classIdentifier: string,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visibilityFilter: VisibilityFilter
): Promise<boolean> {
  if(relevantExternalModels === null || visibilityFilter === VisibilityFilter.ONLY_VISIBLE || visibilityFilter === VisibilityFilter.ONLY_VISIBLE_NODES) {
    return false;
  }

  if(contextEntities.rawEntities.find(entity => entity?.id === classIdentifier) === undefined) {
    await tryAllowClassInExternalSemanticModels(classIdentifier, relevantExternalModels);
    refillContextByMissingEntities(relevantExternalModels, contextEntities);
    return true;
  }

  return false;
}

/**
 * For each of the {@link ExternalSemanticModels} try to allow the given {@link classId}
 */
async function tryAllowClassInExternalSemanticModels(
  classId: string,
  relevantExternalModels: ExternalSemanticModel[] | null
) {
  if(relevantExternalModels === null) {
    return;
  }

  // Try everything, we have no idea in which external model it resides
  for (const externalModelWhereSelectedClassCouldPossiblyReside of relevantExternalModels) {
    if(externalModelWhereSelectedClassCouldPossiblyReside !== undefined) {
      await externalModelWhereSelectedClassCouldPossiblyReside.allowClass(classId);
    }
  }
}

/**
 * Extends the internally saved ({@link contextEntities}), so like classes, rawEntities, etc. based on entities present in {@link relevantExternalModels},
 * but not present in the {@link contextEntities}.
 */
function refillContextByMissingEntities(
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities
): void {
  if(relevantExternalModels === null) {
    return;
  }

  relevantExternalModels.forEach(relevantExternalModel => {
    extendEntityArraysBasedOnExternalAllowanceOfSurroundings(relevantExternalModel, contextEntities);
  });
}

/**
 * Extends the classes, rawEntities, profiles, etc. - stored in {@link contextEntities} based on newly added (allowed) entities from {@link relevantExternalModel}
 * @param relevantExternalModel The model to search in for entities missing in {@link contextEntities}.
 */
function extendEntityArraysBasedOnExternalAllowanceOfSurroundings(
  relevantExternalModel: ExternalSemanticModel,
  contextEntities: ClassesContextEntities
): void {
  const newRawEntities: Entity[] = [];
  const externalEntities = relevantExternalModel.getEntities();
  Object.values(externalEntities).forEach(entity => {
    if(contextEntities.rawEntities.find(rawEntity => entity.id === rawEntity?.id) === undefined) {
      newRawEntities.push(entity);
      if(isSemanticModelClass(entity)) {
        contextEntities.classes.push(entity);
      }
      else if(isSemanticModelClassUsage(entity)) {
        contextEntities.profiles.push(entity);
      }
      else if(isSemanticModelGeneralization(entity)) {
        contextEntities.generalizations.push(entity);
      }
      else if(isSemanticModelRelationshipUsage(entity)) {
        contextEntities.profiles.push(entity);
      }
      else if(isSemanticModelRelationship(entity)) {
        contextEntities.relationships.push(entity);
      }
    }
  });

  contextEntities.rawEntities = contextEntities.rawEntities.concat(newRawEntities);
}

function isClassOrClassProfile(
  classId: string,
  contextEntities: ClassesContextEntities
) {
  return !(contextEntities.classes.find(cclass => cclass.id === classId) === undefined &&
                                          contextEntities.profiles.find(profile => profile.id === classId) === undefined);
}

/**
 * The internal function used for the extension through associations (and profiled associations), the type of association is decided through
 * {@link associationType} and the direction is decided through {@link directionOfExtension}. The result of extension is put inside {@link outputToExtend}
 * (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughAssociation(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  directionOfExtension: SourceOrTarget,
  associationType: AssociationType,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
): Promise<void> {
  const checkForAssociatedClassOrClassProfile = async (
    classInSelection: string,
    endContainingClassInSelection: SourceOrTarget,
    relationship: SemanticModelRelationship
  ) => {
    // Maybe possible issues with attributes?
    const endIndex = convertSTTypeToEndIndex(endContainingClassInSelection);
    const otherEndIndex = convertSTTypeToEndIndex(getTheOtherEndForSTType(endContainingClassInSelection));
    const otherEndId = relationship.ends[otherEndIndex]?.concept;

    if(otherEndId !== undefined && otherEndId !== null) {
      await tryAllowClassInExternalModelsIfNotFound(otherEndId, relevantExternalModels, contextEntities, visibilityFilter);
    }

    if(relationship.ends[endIndex]?.concept === classInSelection && otherEndId !== null) {
      let classOnOtherEnd: SemanticModelClass | SemanticModelClassUsage | undefined = contextEntities.classes.find(cclass => cclass.id === otherEndId);
      if(classOnOtherEnd === undefined) {
        const profile = contextEntities.profiles.find(profile => profile.id === otherEndId);
        if(isSemanticModelClassUsage(profile as Entity)) {
          classOnOtherEnd = contextEntities.profiles.find(profile => profile.id === otherEndId) as SemanticModelClassUsage;
        }
      }
      return classOnOtherEnd;
    }
    else {
      return null;
    }
  };

  //
  //

  for(const selectedClassId of nodeSelection.identifiers) {
    const selectedClassSemanticId = getSemanticClassIdentifier(selectedClassId, nodeSelection.areIdentifiersFromVisualModel, visualModel);
    if(selectedClassSemanticId === null) {
      // TODO RadStr: Maybe log error
      continue;
    }

    if(!isClassOrClassProfile(selectedClassSemanticId, contextEntities)) {
      return;         // TODO RadStr: Maybe remove from the selection?
    }

    await allowSurroundingsInExternalModels(selectedClassSemanticId, relevantExternalModels, contextEntities, visibilityFilter);

    let relationshipsToCheck: {
            relationships: SemanticModelRelationship[],
            profileIdentifiers: string[],
         } = { relationships: [], profileIdentifiers: [] };
    if(associationType === "PROFILE-EDGE") {
      contextEntities.profiles.forEach(profile => {
        if(isSemanticModelRelationshipUsage(profile)) {
          const profiledRelationship = contextEntities.relationships.find(relationship => {
            return relationship.id === profile.usageOf;
          });
          if(profiledRelationship !== undefined) {
            relationshipsToCheck.relationships.push(profiledRelationship);
            relationshipsToCheck.profileIdentifiers.push(profile.id);
          }
        }
      });
    }
    else if(associationType === "CLASSIC") {
      relationshipsToCheck = {
        relationships: contextEntities.relationships,
        profileIdentifiers: []
      };
    }

    const extension: {
            classInExtension: SemanticModelClass | SemanticModelClassUsage,
            edgeAddingClass: string
        }[] = [];

    for(let i = 0; i < relationshipsToCheck.relationships.length; i++) {
      const extensionCandidate = await checkForAssociatedClassOrClassProfile(selectedClassSemanticId,
        getTheOtherEndForSTType(directionOfExtension),
        relationshipsToCheck.relationships[i]);
      if(extensionCandidate !== null && extensionCandidate !== undefined) {
        extension.push({
          classInExtension: extensionCandidate,
          edgeAddingClass: relationshipsToCheck?.profileIdentifiers?.[i] ?? relationshipsToCheck.relationships[i].id
        });
      }
    }

    extension.forEach(({classInExtension, edgeAddingClass}) => {
      addToExtensionIfSatisfiesVisibilityFilter(outputToExtend, visibilityFilter, classInExtension.id, edgeAddingClass,
        visualModel, selectedClassId, nodeSelection.areIdentifiersFromVisualModel, contextEntities);
    });
  }
}

/**
 * Extends {@link outputToExtend} by all direct association sources, which also pass the {@link visibilityFilter}
 * and may possibly reside in non-expanded parts of {@link relevantExternalModels}.
 * The result of extension is put inside {@link outputToExtend} (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughAssociationSources(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
): Promise<void> {
  await extendThroughAssociation(nodeSelection, visibilityFilter, "SOURCE", "CLASSIC",
    outputToExtend, relevantExternalModels, contextEntities, visualModel);
}

/**
 * Extends {@link outputToExtend} by all direct association targets, which also pass the {@link visibilityFilter}
 * and may possibly reside in non-expanded parts of {@link relevantExternalModels}.
 * The result of extension is put inside {@link outputToExtend} (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughAssociationTargets(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
): Promise<void> {
  await extendThroughAssociation(nodeSelection, visibilityFilter, "TARGET", "CLASSIC",
    outputToExtend, relevantExternalModels, contextEntities, visualModel);
}

//
//

/**
 * Extends {@link outputToExtend} by all direct profiled edges sources, which also pass the {@link visibilityFilter}
 * and may possibly reside in non-expanded parts of {@link relevantExternalModels}.
 * The result of extension is put inside {@link outputToExtend} (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughProfileEdgeSources(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
): Promise<void> {
  await extendThroughAssociation(nodeSelection, visibilityFilter, "SOURCE", "PROFILE-EDGE",
    outputToExtend, relevantExternalModels, contextEntities, visualModel);
}

/**
 * Extends {@link outputToExtend} by all direct profiled edges targets, which also pass the {@link visibilityFilter}
 * and may possibly reside in non-expanded parts of {@link relevantExternalModels}.
 * The result of extension is put inside {@link outputToExtend} (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughProfileEdgeTargets(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
): Promise<void> {
  await extendThroughAssociation(nodeSelection, visibilityFilter, "TARGET", "PROFILE-EDGE",
    outputToExtend, relevantExternalModels, contextEntities, visualModel);
}

//
//

type ParentOrChild = "PARENT" | "CHILD";
type ParentOrChildGeneralizationProperty = "parent" | "child";
function getTheOtherEndForPCType(parentOrChild: ParentOrChild): ParentOrChild {
  return parentOrChild === "CHILD" ? "PARENT" : "CHILD";
}

/**
 * Helper function to convert between two internal types
 */
function convertParentChildToGeneralizationProperty(parentChild: ParentOrChild): ParentOrChildGeneralizationProperty {
  return parentChild.toLowerCase() as ParentOrChildGeneralizationProperty;
}

/**
 * The internal function used for the extension through generalization, the direction of extension is decided through {@link directionOfExtension} parameter.
 * The result of extension is put inside {@link outputToExtend} (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughGeneralization(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  directionOfExtension: ParentOrChild,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
): Promise<void> {
  for(const selectedClassId of nodeSelection.identifiers) {
    const selectedClassSemanticId = getSemanticClassIdentifier(selectedClassId, nodeSelection.areIdentifiersFromVisualModel, visualModel);
    if(selectedClassSemanticId === null) {
      // TODO RadStr: Maybe log error
      continue;
    }

    if(!isClassOrClassProfile(selectedClassSemanticId, contextEntities)) {
      return;         // TODO RadStr: Maybe remove from the selection?
    }
    // TODO RadStr: I think that it isn't necessary, it is enough to just call the tryAllowClass method, but this is for future, when I will actually need it
    //              and that it is probably for the use-case to put neighborhood of node to visual model ... right now it is difficult to test
    await allowSurroundingsInExternalModels(selectedClassSemanticId, relevantExternalModels, contextEntities, visibilityFilter);

    const theEndOfGeneralizationWhereShouldBeTheSelectedClass = convertParentChildToGeneralizationProperty(getTheOtherEndForPCType(directionOfExtension));
    const theOtherEndOfGeneralization = convertParentChildToGeneralizationProperty(directionOfExtension);
    for(const generalization of contextEntities.generalizations) {
      if(generalization[theEndOfGeneralizationWhereShouldBeTheSelectedClass] === selectedClassSemanticId) {
        const otherEndId = generalization[theOtherEndOfGeneralization];
        await tryAllowClassInExternalModelsIfNotFound(otherEndId, relevantExternalModels, contextEntities, visibilityFilter);
        addToExtensionIfSatisfiesVisibilityFilter(outputToExtend, visibilityFilter, otherEndId, generalization.id, visualModel,
          selectedClassId, nodeSelection.areIdentifiersFromVisualModel, contextEntities);
      }
    }
  }
}

/**
 * Extends {@link outputToExtend} by all direct parents in generalization hirearchy, which also pass the {@link visibilityFilter}
 * and may possibly reside in non-expanded parts of {@link relevantExternalModels}.
 * The result of extension is put inside {@link outputToExtend} (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughGeneralizationParents(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
): Promise<void> {
  await extendThroughGeneralization(nodeSelection, visibilityFilter, "PARENT", outputToExtend, relevantExternalModels, contextEntities, visualModel);
}

/**
 * Extends {@link outputToExtend} by all direct children in generalization hirearchy, which also pass the {@link visibilityFilter}
 * and may possibly reside in non-expanded parts of {@link relevantExternalModels}.
 * The result of extension is put inside {@link outputToExtend} (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughGeneralizationChildren(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
): Promise<void> {
  await extendThroughGeneralization(nodeSelection, visibilityFilter, "CHILD", outputToExtend, relevantExternalModels, contextEntities, visualModel);
}

////////////////////////////////////////
////////////////////////////////////////

export function getSemanticClassIdentifier(
  nodeIdentifier: string,
  isNodeIdentifierFromVisualModel: boolean,
  visualModel: VisualModel | null
): string | null {
  let semanticClassId = nodeIdentifier;
  if(isNodeIdentifierFromVisualModel) {
    const visualEntity = visualModel?.getVisualEntity(nodeIdentifier);
    if(visualEntity === null || visualEntity === undefined || !isVisualNode(visualEntity)) {
      return null;
    }

    semanticClassId = visualEntity.representedEntity;
  }

  return semanticClassId;
}

export function getSemanticEdgeIdentifier(
  edgeIdentifier: string,
  isEdgeIdentifierFromVisualModel: boolean,
  visualModel: VisualModel | null
): string | null | "CLASS-PROFILE-EDGE" {
  let semanticEdgeId = edgeIdentifier;
  if(isEdgeIdentifierFromVisualModel) {
    const visualEntity = visualModel?.getVisualEntity(edgeIdentifier);
    if(visualEntity === null || visualEntity === undefined) {
      console.warn("Entity is null");
      return null;
    }
    if(isVisualProfileRelationship(visualEntity)) {
      return "CLASS-PROFILE-EDGE";
    }
    if(!isVisualRelationship(visualEntity)) {
      console.warn("Entity is not visual relationship");
      console.warn(visualEntity);
      return null;
    }

    semanticEdgeId = visualEntity.representedRelationship;
  }

  return semanticEdgeId;
}

/**
 * The internal function used for the extension through profiles, the direction of extension is decided through {@link directionOfExtension} parameter.
 * The result of extension is put inside {@link outputToExtend} (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughClassProfile(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  directionOfExtension: ParentOrChild,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
) {
  for(const selectedClassId of nodeSelection.identifiers) {
    const selectedClassSemanticId = getSemanticClassIdentifier(selectedClassId, nodeSelection.areIdentifiersFromVisualModel, visualModel);
    if(selectedClassSemanticId === null) {
      // TODO RadStr: Maybe log error
      continue;
    }

    const selectedClass = contextEntities.classes.find(entity => entity?.id === selectedClassSemanticId) ??
                                contextEntities.profiles.find(entity => isSemanticModelClassUsage(entity) && entity?.id === selectedClassSemanticId);
    if(selectedClass === undefined) {
      continue;         // TODO RadStr: Maybe remove from the selection?
    }

    if(directionOfExtension === "CHILD") {
      contextEntities.profiles.forEach(entity => {
        if(entity.usageOf === selectedClassSemanticId) {
          addToExtensionIfSatisfiesVisibilityFilter(outputToExtend, visibilityFilter, entity.id,
            SpecialEdge.FROM_PROFILED_CLASS_TO_CLASS_PROFILE, visualModel, selectedClassId,
            nodeSelection.areIdentifiersFromVisualModel, contextEntities);
        }
      });
    }
    else if(directionOfExtension === "PARENT") {
      if(!isSemanticModelClassUsage(selectedClass)) {
        continue;
      }
      const selectedClassAsProfile = (selectedClass as SemanticModelClassUsage);

      await tryAllowClassInExternalModelsIfNotFound(selectedClassAsProfile.usageOf, relevantExternalModels, contextEntities, visibilityFilter);
      addToExtensionIfSatisfiesVisibilityFilter(outputToExtend, visibilityFilter, selectedClassAsProfile.usageOf,
        SpecialEdge.FROM_CLASS_PROFILE_TO_PROFILED_CLASS, visualModel, selectedClassId,
        nodeSelection.areIdentifiersFromVisualModel, contextEntities);
    }
  }
}

/**
 * Extends {@link outputToExtend} by all directly profiled classes, which also pass the {@link visibilityFilter}
 * and may possibly reside in non-expanded parts of {@link relevantExternalModels}.
 * The result of extension is put inside {@link outputToExtend} (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughClassProfileParents(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
) {
  await extendThroughClassProfile(nodeSelection, visibilityFilter, "PARENT", outputToExtend, relevantExternalModels, contextEntities, visualModel);
}

/**
 * Extends {@link outputToExtend} by all direct profile classes, which also pass the {@link visibilityFilter}
 * and may possibly reside in non-expanded parts of {@link relevantExternalModels}.
 * The result of extension is put inside {@link outputToExtend} (non-destructively - i.e. the parameter is extended by the result).
 */
async function extendThroughClassProfileChildren(
  nodeSelection: NodeSelection,
  visibilityFilter: VisibilityFilter,
  outputToExtend: SelectionExtension,
  relevantExternalModels: ExternalSemanticModel[] | null,
  contextEntities: ClassesContextEntities,
  visualModel: VisualModel | null
): Promise<void> {
  await extendThroughClassProfile(nodeSelection, visibilityFilter, "CHILD", outputToExtend, relevantExternalModels, contextEntities, visualModel);
}

//
//

const getIdentifierForEntity = (
  entityIdentifier: string,
  shouldReturnVisualIdentifiers: boolean,
  visualModel: VisualModel | null
): string | null => {
  if(shouldReturnVisualIdentifiers) {
    if(visualModel === null) {
      return null;
    }

    const visualEntity = visualModel.getVisualEntityForRepresented(entityIdentifier);
    if(visualEntity === null) {
      return null;
    }

    return visualEntity.identifier;
  }

  return entityIdentifier;
}

/**
 * @returns Class and Class usages of the given moddel
 */
export const getClassesAndClassUsages = (model: EntityModel): (SemanticModelClass | SemanticModelClassUsage)[] => {
  return Object.values(model.getEntities()).filter((entity) => isSemanticModelClass(entity) || isSemanticModelClassUsage(entity));
};

export function getSelectionForWholeSemanticModel(
  semanticModel: EntityModel,
  shouldReturnVisualIdentifiers: boolean,
  visualModel: VisualModel | null
): Selections {
  const result: Selections = {
    nodeSelection: [],
    edgeSelection: [],
  };

  const entities = Object.values(semanticModel.getEntities());
  entities.forEach(entity => {
    const identifier = getIdentifierForEntity(entity.id, shouldReturnVisualIdentifiers, visualModel);
    if(identifier !== null) {
      const isClassOrClassProfile = isSemanticModelClass(entity) || isSemanticModelClassUsage(entity);
      (isClassOrClassProfile ? result.nodeSelection : result.edgeSelection).push(identifier);
    }
  });

  return result;
}
