import { useEffect, useMemo } from "react";

import {
  type SemanticModelClass,
  type SemanticModelGeneralization,
  type SemanticModelRelationship,
  isSemanticModelClass,
  isSemanticModelGeneralization,
  isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  type SemanticModelClassUsage,
  type SemanticModelRelationshipUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import {
  VisualDiagramNode,
  type VisualEntity,
  VisualGroup,
  type VisualModel,
  type VisualNode,
  type VisualProfileRelationship,
  type VisualRelationship,
  WritableVisualModel,
  isVisualDiagramNode,
  isVisualGroup,
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
  isWritableVisualModel,
} from "@dataspecer/core-v2/visual-model";
import {
  type SemanticModelAggregatorView,
} from "@dataspecer/core-v2/semantic-model/aggregator";

import { type UseModelGraphContextType, useModelGraphContext } from "./context/model-context";
import { type UseClassesContextType, useClassesContext } from "./context/classes-context";
import {
  cardinalityToHumanLabel,
  getDomainAndRange,
  getDomainAndRangeConceptsIncludingGeneralizations
} from "./util/relationship-utils";
import { ActionsContextType, useActions } from "./action/actions-react-binding";
import {
  Diagram,
  type Edge,
  EdgeType,
  Group,
  type NodeItem,
  type Node,
  NodeType,
  DiagramNodeTypes,
  VisualModelDiagramNode
} from "./diagram/";
import { type UseDiagramType } from "./diagram/diagram-hook";
import { configuration, createLogger } from "./application";
import { getDescriptionLanguageString, getUsageNoteLanguageString } from "./util/name-utils";
import { getLocalizedStringFromLanguageString } from "./util/language-utils";
import { getIri, getModelIri } from "./util/iri-utils";
import { findSourceModelOfEntity } from "./service/model-service";
import { type EntityModel } from "@dataspecer/core-v2";
import { Options, useOptions } from "./configuration/options";
import {
  getGroupMappings,
  getClassesAndDiagramNodesModelsFromVisualModelRecursively,
} from "./action/utilities";
import {
  synchronizeOnAggregatorChange,
  updateVisualAttributesBasedOnSemanticChanges
} from "./dataspecer/visual-model/aggregator-to-visual-model-adapter";
import {
  isSemanticModelClassProfile,
  isSemanticModelRelationshipProfile,
  SemanticModelClassProfile,
  SemanticModelRelationshipProfile
} from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { EntityDsIdentifier } from "./dataspecer/entity-model";
import { createAttributeProfileLabel, createGetVisualEntitiesForRepresentedGlobalWrapper, getEntityLabelToShowInDiagram, VisualsForRepresentedWrapper } from "./util/utils";

import "./visualization.css";
import { addToRecordArray } from "./utilities/functional";

const LOG = createLogger(import.meta.url);

const DEFAULT_MODEL_COLOR = configuration().defaultModelColor;

export const Visualization = () => {
  const options = useOptions();
  const graph = useModelGraphContext();
  const actions = useActions();
  const classesContext = useClassesContext();

  const aggregatorView = graph.aggregatorView;
  const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);

  // Register a callback with aggregator for visualization
  // - remove what has been removed from the visualization state
  // - update entities that have been updated
  //   - rerender updated classes
  //   - if they have updated attributes, update them as well
  //   - collect updated relationships and relationship profiles - rerender them after classes are on the canvas
  // the callback is registered for twice
  // - first time for the semantic information about the models
  //   - new relationship between two classes
  //   - new attribute for a class
  //   - rename of a concept
  // - second time for the visual information from the active visual model
  //   - change of visibility, position
  useEffect(() => {

    const previousEntities = aggregatorView.getEntities();
    const unsubscribeSemanticAggregatorCallback = aggregatorView.subscribeToChanges((updated, removed) => {
      console.log("[VISUALIZATION] SemanticModelAggregatorView.subscribeToChanges", { updated, removed });
      if (isWritableVisualModel(activeVisualModel)) {
        synchronizeOnAggregatorChange(activeVisualModel, updated, removed);
        updateVisualAttributesBasedOnSemanticChanges(activeVisualModel, updated, removed, previousEntities);
      }
    });

    const unsubscribeCanvasCallback = aggregatorView.getActiveVisualModel()?.subscribeToChanges({
      modelColorDidChange(model) {
        if (activeVisualModel === null) {
          return;
        }
        // We ignore model color changes here for now.
        console.log("[VISUALIZATION] VisualModel.subscribeToChanges.modelColorDidChange", { model });
        propagateVisualModelColorChangesToVisualization(
          options, activeVisualModel, actions.diagram, aggregatorView, classesContext, graph,
          model
        );
      },
      visualEntitiesDidChange(changes) {
        if (activeVisualModel === null) {
          return;
        }
        console.log("[VISUALIZATION] VisualModel.subscribeToChanges.visualEntitiesDidChange", { changes });
        onChangeVisualEntities(
          options, activeVisualModel, actions.diagram, aggregatorView, classesContext, graph,
          changes,
        );
      },
    });

    return () => {
      unsubscribeSemanticAggregatorCallback?.();
      unsubscribeCanvasCallback?.();
    };

  }, [options, activeVisualModel, actions, aggregatorView, classesContext, graph]);

  // Update canvas content on view change.
  useEffect(() => {
    console.log("[VISUALIZATION] Something has changed, recreating diagram visual.", activeVisualModel);
    validateVisualModel(actions, activeVisualModel, aggregatorView, classesContext, graph.models);
    onChangeVisualModel(options, activeVisualModel, actions.diagram, aggregatorView, classesContext, graph);
  }, [options, activeVisualModel, actions, aggregatorView, classesContext, graph]);

  return (
    <>
      <div className="h-[80vh] w-full md:h-full">
        {actions.diagram === null ? null : <Diagram diagram={actions.diagram} />}
      </div>
    </>
  );
};

function propagateVisualModelColorChangesToVisualization(
  options: Options,
  visualModel: VisualModel | null,
  diagram: UseDiagramType | null,
  aggregatorView: SemanticModelAggregatorView,
  classesContext: UseClassesContextType,
  graphContext: UseModelGraphContextType,
  changedModelIdentifier: string,
) {
  if (visualModel === null) {
    LOG.warn("Visual model change is ignored as visual model is not ready! This should not happen.");
    return;
  }
  if (diagram === null || !diagram.areActionsReady) {
    LOG.warn("Visual model change is ignored as the diagram is not ready!");
    return;
  }

  // We need to re-render entities from the model.
  // We just collect them and use the other visual update method,
  // simulating change in the entities.
  // TODO We should not reuse the function in this way, but it was quick solution.
  const changes: {
    previous: VisualEntity | null;
    next: VisualEntity | null;
  }[] = [];

  // We need to update all entities from given model.
  // The entities remain the same as the change is in the model.
  for (const [_, entity] of visualModel.getVisualEntities()) {
    if (isVisualNode(entity)) {
      if (entity.model === changedModelIdentifier) {
        changes.push({ previous: entity, next: entity });
      }
    } else if (isVisualRelationship(entity)) {
      if (entity.model === changedModelIdentifier) {
        changes.push({ previous: entity, next: entity });
      }
    }
  }

  // Call the change method.
  onChangeVisualEntities(
    options, visualModel, diagram, aggregatorView, classesContext,
    graphContext, changes)
}

/**
 * Validates correctness (not complete) of visual model based on semantic data and modifies it based on it.
 */
function validateVisualModel(
  actions: ActionsContextType,
  visualModel: VisualModel | null,
  aggregatorView: SemanticModelAggregatorView,
  classesContext: UseClassesContextType,
  models: Map<string, EntityModel>
) {
  if(!isWritableVisualModel(visualModel) || visualModel === null) {
    return;
  }

  const allClasses = [
    ...classesContext.classes,
    ...classesContext.classProfiles
  ].map(cclass => cclass.id);

  const relationships = [
    ...classesContext.relationships,
    ...classesContext.generalizations,
    ...classesContext.relationshipProfiles,
  ];

  validateVisualModelDiagramNodes(actions, visualModel, aggregatorView, allClasses, relationships);
  validateVisualModelNonDiagramNodes(actions, visualModel, classesContext, models);
}

function validateVisualModelNonDiagramNodes(
  actions: ActionsContextType,
  visualModel: WritableVisualModel,
  classesContext: UseClassesContextType,
  models: Map<string, EntityModel>,
) {
  const missingVisualProfileRelationships: Omit<VisualProfileRelationship, "identifier" | "type">[] = [];
  const invalidEntities: string[] = [];
  // Map the visual entity it is profile (that is visualTarget) of to its relationships
  const validVisualProfileRelationships: Record<string, VisualProfileRelationship[]> = {};
  // Map the visual entity id to the visual entity and class profile it represents
  const classProfilesInVisualModel: Record<string,
    {
      visualEntity: VisualNode,
      classProfile: SemanticModelClassProfile
    }> = {};

  // For now just validate the class profile edges, they are currently not removed from visual model.
  // That was the case even when we had only 1 visual model.
  for (const [_id, visualEntity] of visualModel.getVisualEntities()) {
    if (isVisualProfileRelationship(visualEntity)) {    // Find the invalid ones
      const source = visualModel.getVisualEntity(visualEntity.visualSource);
      const target = visualModel.getVisualEntity(visualEntity.visualTarget);
      if (source === null || target === null) {
        invalidEntities.push(visualEntity.identifier);
        continue;
      }
      else if (isVisualNode(source) && isVisualNode(target)) {
        const semanticSource = classesContext.classProfiles
          .find(classProfile => classProfile.id === source.representedEntity);

        if(semanticSource === undefined) {
          invalidEntities.push(visualEntity.identifier);
          continue;
        }

        const isSemanticTargetPresent = semanticSource.profiling.includes(target.representedEntity)
        if(!isSemanticTargetPresent) {
          invalidEntities.push(visualEntity.identifier);
          continue;
        }

        addToRecordArray(visualEntity.visualTarget, visualEntity, validVisualProfileRelationships);
      }
    }
    else if (isVisualNode(visualEntity)) {
      const classProfile = classesContext.classProfiles.find(classProfile => classProfile.id === visualEntity.representedEntity);
      if (classProfile === undefined) {
        continue;
      }
      classProfilesInVisualModel[visualEntity.identifier] = {
        visualEntity,
        classProfile
      };
    }
  }

  // Find the missing ones
  for (const {visualEntity, classProfile} of Object.values(classProfilesInVisualModel)) {
    for (const profileOf of classProfile.profiling) {
      const profileOfVisuals = visualModel.getVisualEntitiesForRepresented(profileOf);
      for (const profileOfVisual of profileOfVisuals) {
        const isVisualProfileRelationshipInModel = validVisualProfileRelationships[profileOfVisual.identifier]
          ?.find(profileRelationship => profileRelationship.visualSource === visualEntity.identifier) !== undefined;
        if (!isVisualProfileRelationshipInModel) {
          const model = findSourceModelOfEntity(classProfile.id, models);
          if (model === null) {
            LOG.error("Missing the source model when creating missing profile relationship on validation");
            continue;
          }
          const profileRelationshipToAdd: Omit<VisualProfileRelationship, "identifier" | "type"> = {
            entity: classProfile.id,
            model: model.getId(),
            waypoints: [],
            visualSource: visualEntity.identifier,
            visualTarget: profileOfVisual.identifier
          }
          missingVisualProfileRelationships.push(profileRelationshipToAdd);
        }
      }
    }
  }

  if(invalidEntities.length > 0) {
    actions.removeFromVisualModelByVisual(invalidEntities);
  }
  for (const missingVisualProfileRelationship of missingVisualProfileRelationships) {
    visualModel.addVisualProfileRelationship(missingVisualProfileRelationship);
  }
}

function validateVisualModelDiagramNodes(
  actions: ActionsContextType,
  visualModel: VisualModel,
  aggregatorView: SemanticModelAggregatorView,
  allClasses: string[],
  relationships: (SemanticModelRelationship | SemanticModelGeneralization | SemanticModelRelationshipProfile)[],
) {
  // The algorithm idea isn't that complicated
  // We just go through all the
  // visual relationships in visual model and check the semantic ends of them and remove the edge,
  // if at least on the ends is missing.
  // For actual visual relationships this is simple.
  // For visual Profile relationships it is not,
  // so I just removed the attempt and by default we don't show class profile edges between diagram nodes!
  // ... so this next part of comment is invalid, but it still may contain some relevant info - TODO RadStr: Remove on clean-up
  // The reason why it is not that simple is that:
  // The entity property on visual profile edge is no longer enough to identify
  // the original semantic profile source and target, since unlike in usages it is no longer 1:1 mapping.
  // So we do it in a bit more convoluted way.
  // The convoluted way is basically that we have to create bunch of maps and compute number
  // of profiles classes, which are supposed to be in each visual diagram node for each visual source.
  // and if we are not equal, we remove the excessive edges.

  const getByRepresentedWrapper = createGetVisualEntitiesForRepresentedGlobalWrapper(
    aggregatorView.getAvailableVisualModels(), visualModel);
  const visualModelsGetByRepresentedGlobal: Record<string, VisualsForRepresentedWrapper> = {
    [visualModel.getIdentifier()]: getByRepresentedWrapper,
  };

  const invalidEntities: string[] = [];
  for (const [_id, visualEntity] of visualModel.getVisualEntities()) {
    if(isVisualRelationship(visualEntity)) {
      const represented = relationships.find(relationship => relationship.id === visualEntity.representedRelationship);
      if (represented === undefined) {
        // Should not happen, but better be safe
        console.error("Can't find represented relationship when validating, this probably should not happen");
        invalidEntities.push(visualEntity.identifier);
        continue;
      }

      const { domain, range } = getDomainAndRangeConceptsIncludingGeneralizations(represented);

      // The end is missing
      if (domain === null || !allClasses.includes(domain) || range === null || !allClasses.includes(range)) {
        invalidEntities.push(visualEntity.identifier);
        continue;
      }
      // Check if the visual end is the same as the semantic one
      const visualEdgeSource = visualModel.getVisualEntity(visualEntity.visualSource);
      const visualEdgeTarget = visualModel.getVisualEntity(visualEntity.visualTarget);
      if (visualEdgeSource === null || visualEdgeTarget === null) {
        invalidEntities.push(visualEntity.identifier);
        continue;
      }

      const isDomainValid = checkEdgeEndValidityAndExtend(
        visualModelsGetByRepresentedGlobal, aggregatorView,
        visualEdgeSource, domain, visualEntity.identifier, invalidEntities);
      if (!isDomainValid) {
        continue;
      }

      const isRangeValid = checkEdgeEndValidityAndExtend(
        visualModelsGetByRepresentedGlobal, aggregatorView,
        visualEdgeTarget, range, visualEntity.identifier, invalidEntities);
      if (!isRangeValid) {
        continue;
      }
    }
    else if (isVisualProfileRelationship(visualEntity)) {
      // Previously we were trying to ALWAYS create visual profile relationships, now we just remove all of them.
      // Meaning all going from/to visual diagram node. We did that because:
      //  1) It did not work properly for some cases
      //  2) The class profile edges pointing from/to visual diagram node don't add much relevant information
      //     + They can not be removed from visual model, so it just introduces clutter
      const isSourceInvalid = validateVisualProfileRelationshipEnd(
        visualModel, visualEntity.visualSource, visualEntity.identifier, invalidEntities);
      if (isSourceInvalid) {
        continue;
      }
      validateVisualProfileRelationshipEnd(
        visualModel, visualEntity.visualTarget, visualEntity.identifier, invalidEntities);
    }
  }

  if(invalidEntities.length > 0) {
    actions.removeFromVisualModelByVisual(invalidEntities);
  }
}

/**
 * @returns Returns true if the end is not in visual model or it is visual diagram node.
 *  Also in such case the {@link invalidEntitiesToExtend} are extended
 */
function validateVisualProfileRelationshipEnd(
  visualModel: VisualModel,
  visualEndIdentifier: string,
  VisualProfileRelationship: string,
  invalidEntitiesToExtend: string[],
): boolean {
  const visualEnd = visualModel.getVisualEntity(visualEndIdentifier);
  if (visualEnd === null || isVisualDiagramNode(visualEnd)) {
    invalidEntitiesToExtend.push(VisualProfileRelationship);
    return true;
  }

  return false;
}

/**
 * Extends {@link invalidEntitiesToExtend} if necessary.
 * @returns returns true if everything is in order, false if there was at least one invalid entity
 *  (Either only the edge or the edge together with the end).
 */
function checkEdgeEndValidityAndExtend(
  visualModelToContentMappings: Record<string, VisualsForRepresentedWrapper>,
  aggregatorView: SemanticModelAggregatorView,
  visualEdgeEnd: VisualEntity,
  supposedSemanticEdgeEnd: string,
  examinedEdge: string,
  invalidEntitiesToExtend: string[]
): boolean {
  let isValid: boolean | null = true;

  if (isVisualDiagramNode(visualEdgeEnd)) {
    const isDiagramNodeValid = extendMappingsByDiagramNodeModelIfNotSet(
      visualModelToContentMappings, visualEdgeEnd, aggregatorView);
    if (!isDiagramNodeValid) {
      isValid = null;
    }
    else if (visualModelToContentMappings[visualEdgeEnd.representedVisualModel](supposedSemanticEdgeEnd).length === 0) {
      isValid = false;
    }
  }
  else if(isVisualNode(visualEdgeEnd)) {
    if(visualEdgeEnd.representedEntity !== supposedSemanticEdgeEnd) {
      isValid = false;
    }
  }
  else {
    LOG.error("Edge end is not diagram node neither visual node");
    isValid = null;
  }

  if(isValid === null) {
    invalidEntitiesToExtend.push(examinedEdge);
    invalidEntitiesToExtend.push(visualEdgeEnd.identifier);
  }
  else if(!isValid) {
    invalidEntitiesToExtend.push(examinedEdge);
  }

  return isValid ?? false;
}

/**
 * @returns Returns true if everything was in order, false if error occurred
 */
function extendMappingsByDiagramNodeModelIfNotSet(
  visualModelToContentMappings: Record<string, VisualsForRepresentedWrapper>,
  visualEdgeEndPoint: VisualDiagramNode,
  aggregatorView: SemanticModelAggregatorView,
): boolean {
  const availableVisualModels = aggregatorView.getAvailableVisualModels();
  const representedVisualModel = availableVisualModels
    .find(visualModel => visualModel.getIdentifier() === visualEdgeEndPoint.representedVisualModel);
  if (representedVisualModel === undefined) {
    return false;
  }
  if (visualModelToContentMappings[visualEdgeEndPoint.representedVisualModel] === undefined) {
    const getByRepresentedWrapper = createGetVisualEntitiesForRepresentedGlobalWrapper(
      availableVisualModels, representedVisualModel);
    visualModelToContentMappings[visualEdgeEndPoint.representedVisualModel] = getByRepresentedWrapper;
  }

  return true;
}

/**
 * Set content of nodes and edges from the visual model.
 * Effectively erase any previous content.
 *
 * TODO We call setContent which is async, we should return a promise and wait.
 */
function onChangeVisualModel(
  options: Options,
  visualModel: VisualModel | null,
  diagram: UseDiagramType | null,
  aggregatorView: SemanticModelAggregatorView,
  classesContext: UseClassesContextType,
  graphContext: UseModelGraphContextType,
) {
  if (diagram === null || !diagram.areActionsReady) {
    LOG.warn("Visual model change is ignored as the diagram is not ready!");
    return;
  }
  if (visualModel === null) {
    // We just set content to nothing and return.
    void diagram.actions().setContent([], [], []);
    return;
  }

  const models = graphContext.models;
  const entities = aggregatorView.getEntities();
  const relationships = classesContext.relationships;
  const relationshipsUsages = classesContext.usages.filter(isSemanticModelRelationshipUsage);
  const relationshipsProfiles = classesContext.relationshipProfiles;

  const profilingSources = [
    ...classesContext.classes,
    ...classesContext.relationships,
    ...classesContext.usages,
    ...classesContext.classProfiles,
    ...classesContext.relationshipProfiles,
  ];

  const nextNodes: DiagramNodeTypes[] = [];
  const nextEdges: Edge[] = [];
  const nextGroups: VisualGroup[] = [];

  const visualEntities = visualModel.getVisualEntities().values();
  const { nodeToGroupMapping } = getGroupMappings(visualModel);

  for (const visualEntity of visualEntities) {
    if(isVisualDiagramNode(visualEntity)) {

      const node = createVisualModelDiagramNode(
        options, aggregatorView.getAvailableVisualModels(), visualModel,
        visualEntity, nodeToGroupMapping[visualEntity.identifier] ?? null);
      nextNodes.push(node);
    } else if(isVisualGroup(visualEntity)) {
      nextGroups.push(visualEntity);
      continue;
    } else if (isVisualNode(visualEntity)) {
      const entity = entities[visualEntity.representedEntity]?.aggregatedEntity ?? null;
      if (isSemanticModelClassUsage(entity) || isSemanticModelClass(entity)
        || isSemanticModelClassProfile(entity)) {

        const model = findSourceModelOfEntity(entity.id, models);
        if (model === null) {
          console.error("Ignored entity for missing model.", { entity });
          continue;
        }

        const node = createDiagramNode(
          options, visualModel,
          relationships, relationshipsUsages, relationshipsProfiles, profilingSources,
          visualEntity, entity, model, nodeToGroupMapping[visualEntity.identifier] ?? null);
        nextNodes.push(node);
      }
    } else if (isVisualRelationship(visualEntity)) {
      const entity = entities[visualEntity.representedRelationship]?.aggregatedEntity ?? null;
      const isRelationship =
        isSemanticModelRelationship(entity) ||
        isSemanticModelRelationshipUsage(entity) ||
        isSemanticModelRelationshipProfile(entity) ||
        isSemanticModelGeneralization(entity);
      if (isRelationship) {
        const model = findSourceModelOfEntity(entity.id, models);
        if (model === null) {
          console.error("Ignored entity for missing model.", { entity });
          continue;
        }
        const edge = createDiagramEdge(
          options, visualModel, profilingSources, visualEntity, entity);
        if (edge !== null) {
          nextEdges.push(edge);
        }
      }
    } else if (isVisualProfileRelationship(visualEntity)) {
      const entity = entities[visualEntity.entity]?.aggregatedEntity ?? null;
      if (entity === null) {
        console.error("Ignored entity as aggregate is null.", { visualEntity });
        continue;
      }
      const model = findSourceModelOfEntity(entity.id, models);
      if (model === null) {
        console.error("Ignored entity for missing model.", { entity });
        continue;
      }

      const profiled: EntityDsIdentifier[] = [];
      if (isSemanticModelClassUsage(entity)) {
        profiled.push(entity.usageOf);
      } else if (isSemanticModelClassProfile(entity)) {
        profiled.push(...entity.profiling);
      } else {
        console.error("Ignored profile relation as entity is not a usage or a profile.", { entity });
        continue;
      }

      const edge = createDiagramEdgeForClassUsageOrProfile(
        visualModel, visualEntity, entity);
      if (edge !== null) {
        nextEdges.push(edge);
      }
    }
    // For now we ignore all other.
  }

  const groupsToSetContentWith = nextGroups.map(visualGroup => {
    return {
      group: createGroupNode(visualGroup),
      content: visualGroup.content,
    };
  });
  void diagram.actions().setContent(nextNodes, nextEdges, groupsToSetContentWith);
}

function createGroupNode(
  visualGroup: VisualGroup,
): Group {
  return {
    identifier: visualGroup.identifier,
  };
}

function createVisualModelDiagramNode(
  options: Options,
  availableVisualModels: VisualModel[],
  sourceVisualModel: VisualModel,
  visualDiagramNode: VisualDiagramNode,
  group: string | null,
): VisualModelDiagramNode {
  // TODO RadStr: SUPER - Why would I need the nodes recursively?
  const containedNodes = getClassesAndDiagramNodesModelsFromVisualModelRecursively(availableVisualModels, visualDiagramNode.representedVisualModel);
  const referencedVisualModel = availableVisualModels.find(availableVisualModel => availableVisualModel.getIdentifier() === visualDiagramNode.representedVisualModel);
  let referencedVisualModelLabel = referencedVisualModel === undefined ?
    "" :
    getLocalizedStringFromLanguageString(referencedVisualModel.getLabel(), options.language);
  if(referencedVisualModelLabel === null) {
    referencedVisualModelLabel = "Visual model node";
  }
  console.info("containedNodes", containedNodes);

  const result: VisualModelDiagramNode = {
    identifier: visualDiagramNode.identifier,
    externalIdentifier: visualDiagramNode.representedVisualModel,
    representedModelAlias: referencedVisualModelLabel,
    label: getLocalizedStringFromLanguageString(visualDiagramNode.label, options.language) ?? referencedVisualModelLabel,
    description: getLocalizedStringFromLanguageString(visualDiagramNode.description, options.language) ?? referencedVisualModelLabel,
    group,
    position: {
      x: visualDiagramNode.position.x,
      y: visualDiagramNode.position.y,
      anchored: visualDiagramNode.position.anchored
    },
    containedNodes,
  };

  return result;
}

function createDiagramNode(
  options: Options,
  visualModel: VisualModel,
  relationships: SemanticModelRelationship[],
  relationshipsUsages: SemanticModelRelationshipUsage[],
  relationshipsProfiles: SemanticModelRelationshipProfile[],
  profilingSources: (
    | SemanticModelClass | SemanticModelRelationship
    | SemanticModelClassUsage | SemanticModelRelationshipUsage
    | SemanticModelClassProfile | SemanticModelRelationshipProfile)[],
  visualNode: VisualNode,
  entity: SemanticModelClass | SemanticModelClassUsage | SemanticModelClassProfile,
  model: EntityModel,
  group: string | null,
): Node {
  const language = options.language;

  // Here we are missing proper implementation of content.
  // See https://github.com/mff-uk/dataspecer/issues/928

  const itemCandidates: Record<string, NodeItem> = {};

  for(const attribute of relationships) {
    if(visualNode.content.includes(attribute.id)) {
      itemCandidates[attribute.id] = {
        identifier: attribute.id,
        label: getEntityLabelToShowInDiagram(language, attribute),
        profileOf: null,
      };
    }
  }

  for(const attributeUsage of relationshipsUsages) {
    if(!visualNode.content.includes(attributeUsage.id)) {
      continue;
    }

    const profileOf = profilingSources.find(
      (item) => item.id === attributeUsage.usageOf);
    itemCandidates[attributeUsage.id] = {
      identifier: attributeUsage.id,
      label: createAttributeProfileLabel(language, attributeUsage),
      profileOf: {
        label: profileOf === undefined ? "" : getEntityLabelToShowInDiagram(language, profileOf),
        usageNote: getUsageNote(language, attributeUsage),
      },
    }
  }

  for (const attributeProfile of relationshipsProfiles) {
    if(!visualNode.content.includes(attributeProfile.id)) {
      continue;
    }

    const profileOf = profilingSources.filter(
      item => attributeProfile.ends.find(end => end.profiling.includes(item.id)) !== undefined);
    itemCandidates[attributeProfile.id] = {
      identifier: attributeProfile.id,
      label: createAttributeProfileLabel(language, attributeProfile),
      profileOf: {
        label: profileOf.map(item => getEntityLabelToShowInDiagram(language, item)).join(", "),
        usageNote: profileOf.map(item => getUsageNote(language, item)).join(", "),
      },
    }
  }

  // Here we could filter using the visualNode.content.
  // Be aware that the update of the semantic attributes comes later,
  // so there is moment when the content of visual node is set,
  // but the corresponding attributes semantic model in are not.
  const items: NodeItem[] = visualNode.content.map(id => itemCandidates[id]).filter(item => item !== undefined);

  const isProfile = isSemanticModelClassUsage(entity)
    || isSemanticModelClassProfile(entity);

  let profileOf: (
    | SemanticModelClass | SemanticModelRelationship
    | SemanticModelClassUsage | SemanticModelRelationshipUsage
    | SemanticModelClassProfile | SemanticModelRelationshipProfile)[] = [];

  if (isSemanticModelClassUsage(entity)) {
    const profile = profilingSources.find(item => item.id === entity.usageOf);
    if (profile !== undefined) {
      profileOf.push(profile);
    }
  } else if (isSemanticModelClassProfile(entity)) {
    profileOf = profilingSources.filter(item => entity.profiling.includes(item.id));
  }

  return {
    type: isProfile ? NodeType.ClassProfile : NodeType.Class,
    identifier: visualNode.identifier,
    externalIdentifier: entity.id,
    label: getEntityLabelToShowInDiagram(language, entity),
    iri: getIri(entity, getModelIri(model)),
    color: visualModel.getModelColor(visualNode.model) ?? DEFAULT_MODEL_COLOR,
    description: getEntityDescription(language, entity),
    group,
    position: {
      ...visualNode.position
    },
    profileOf: !isProfile ? null : {
      label: profileOf.map(item => getEntityLabelToShowInDiagram(language, item)).join(", "),
      usageNote: getUsageNote(language, entity),
    },
    items,
  };
}

function getEntityDescription(
  language: string,
  entity: SemanticModelClass | SemanticModelRelationship |
    SemanticModelClassUsage | SemanticModelRelationshipUsage |
    SemanticModelClassProfile | SemanticModelRelationshipProfile) {
  return getLocalizedStringFromLanguageString(getDescriptionLanguageString(entity), language);
}

function getUsageNote(
  language: string,
  entity: SemanticModelClass | SemanticModelRelationship |
    SemanticModelClassUsage | SemanticModelRelationshipUsage |
    SemanticModelClassProfile | SemanticModelRelationshipProfile) {
  return getLocalizedStringFromLanguageString(getUsageNoteLanguageString(entity), language);
}

function createDiagramEdge(
  options: Options,
  visualModel: VisualModel,
  profilingSources: (
    | SemanticModelClass | SemanticModelRelationship
    | SemanticModelClassUsage | SemanticModelRelationshipUsage
    | SemanticModelClassProfile | SemanticModelRelationshipProfile)[],
  visualRelationship: VisualRelationship,
  entity: SemanticModelRelationship | SemanticModelRelationshipUsage |
    SemanticModelGeneralization | SemanticModelRelationshipProfile,
): Edge | null {
  const identifier = entity.id;
  if (isSemanticModelRelationship(entity)) {
    return createDiagramEdgeForRelationship(
      options, visualModel, profilingSources, visualRelationship, entity);
  } else if (isSemanticModelRelationshipUsage(entity)
    || isSemanticModelRelationshipProfile(entity)) {
    return createDiagramEdgeForRelationshipProfile(
      options, visualModel, profilingSources, visualRelationship, entity);
  } else if (isSemanticModelGeneralization(entity)) {
    return createDiagramEdgeForGeneralization(
      visualModel, visualRelationship, entity);
  }
  throw Error(`Unknown entity type ${identifier}.`);
}

function createDiagramEdgeForRelationship(
  options: Options,
  visualModel: VisualModel,
  profilingSources: (
    | SemanticModelClass | SemanticModelRelationship
    | SemanticModelClassUsage | SemanticModelRelationshipUsage
    | SemanticModelClassProfile | SemanticModelRelationshipProfile)[],
  visualRelationship: VisualRelationship,
  entity: SemanticModelRelationship,
): Edge {
  const language = options.language;

  const profileOf =
    (isSemanticModelRelationshipUsage(entity)
      ? profilingSources.find((e) => e.id === entity.usageOf)
      : null
    ) ?? null;

  const { domain, range } = getDomainAndRange(entity);

  return {
    type: EdgeType.Association,
    identifier: visualRelationship.identifier,
    externalIdentifier: entity.id,
    label: getEntityLabelToShowInDiagram(language, entity),
    source: visualRelationship.visualSource,
    cardinalitySource: cardinalityToHumanLabel(domain?.cardinality),
    target: visualRelationship.visualTarget,
    cardinalityTarget: cardinalityToHumanLabel(range?.cardinality),
    color: visualModel.getModelColor(visualRelationship.model) ?? DEFAULT_MODEL_COLOR,
    waypoints: visualRelationship.waypoints,
    profileOf: profileOf === null ? null : {
      label: getEntityLabelToShowInDiagram(language, profileOf),
      usageNote: getUsageNote(language, entity),
    },
  };
}

function createDiagramEdgeForRelationshipProfile(
  options: Options,
  visualModel: VisualModel,
  profilingSources: (
    | SemanticModelClass | SemanticModelRelationship
    | SemanticModelClassUsage | SemanticModelRelationshipUsage
    | SemanticModelClassProfile | SemanticModelRelationshipProfile)[],
  visualRelationship: VisualRelationship,
  entity: SemanticModelRelationshipUsage | SemanticModelRelationshipProfile,
): Edge {
  const language = options.language;

  const profileOf =
    (isSemanticModelRelationshipUsage(entity)
      ? profilingSources.find((e) => e.id === entity.usageOf)
      : null
    ) ?? null;

  const { domain, range } = getDomainAndRange(entity);

  return {
    type: EdgeType.Association,
    identifier: visualRelationship.identifier,
    externalIdentifier: entity.id,
    label: "<<profile>>\n" + getEntityLabelToShowInDiagram(language, entity),
    source: visualRelationship.visualSource,
    cardinalitySource: cardinalityToHumanLabel(domain?.cardinality),
    target: visualRelationship.visualTarget,
    cardinalityTarget: cardinalityToHumanLabel(range?.cardinality),
    color: visualModel.getModelColor(visualRelationship.model) ?? DEFAULT_MODEL_COLOR,
    waypoints: visualRelationship.waypoints,
    profileOf: profileOf === null ? null : {
      label: getEntityLabelToShowInDiagram(language, profileOf),
      usageNote: getUsageNote(language, entity),
    },
  };
}

function createDiagramEdgeForGeneralization(
  visualModel: VisualModel,
  visualGeneralization: VisualRelationship,
  entity: SemanticModelGeneralization,
): Edge {
  return {
    type: EdgeType.Generalization,
    identifier: visualGeneralization.identifier,
    externalIdentifier: entity.id,
    label: null,
    source: visualGeneralization.visualSource,
    cardinalitySource: null,
    target: visualGeneralization.visualTarget,
    cardinalityTarget: null,
    color: visualModel.getModelColor(visualGeneralization.model) ?? DEFAULT_MODEL_COLOR,
    waypoints: visualGeneralization.waypoints,
    profileOf: null,
  };
}

function createDiagramEdgeForClassUsageOrProfile(
  visualModel: VisualModel,
  classProfileVisualEdge: VisualProfileRelationship,
  entity: SemanticModelClassUsage | SemanticModelClassProfile,
): Edge | null {
  return {
    type: EdgeType.ClassProfile,
    identifier: classProfileVisualEdge.identifier,
    externalIdentifier: entity.id,
    label: "<<profile>>",
    source: classProfileVisualEdge.visualSource,
    cardinalitySource: null,
    target: classProfileVisualEdge.visualTarget,
    cardinalityTarget: null,
    color: visualModel.getModelColor(classProfileVisualEdge.model) ?? DEFAULT_MODEL_COLOR,
    waypoints: classProfileVisualEdge.waypoints,
    profileOf: null,
  };
}

/**
 * This method is also called when there is a change in model color!
 */
function onChangeVisualEntities(
  options: Options,
  visualModel: VisualModel | null,
  diagram: UseDiagramType | null,
  aggregatorView: SemanticModelAggregatorView,
  classesContext: UseClassesContextType,
  graphContext: UseModelGraphContextType,
  changes: {
    previous: VisualEntity | null;
    next: VisualEntity | null;
  }[]
) {
  if (diagram === null || !diagram.areActionsReady) {
    LOG.warn("Visual entities change is ignored as the diagram is not ready!");
    return;
  }
  if (visualModel === null) {
    // We just set content to nothing and return.
    void diagram.actions().setContent([], [], []);
    return;
  }
  const models = graphContext.models;
  const entities = aggregatorView.getEntities();
  const relationships = classesContext.relationships;
  const relationshipsUsages = classesContext.usages.filter(isSemanticModelRelationshipUsage);;
  const relationshipsProfiles = classesContext.relationshipProfiles;

  const profilingSources = [
    ...classesContext.classes,
    ...classesContext.relationships,
    ...classesContext.usages,
    ...classesContext.classProfiles,
    ...classesContext.relationshipProfiles,
  ];

  const actions = diagram.actions();

  const groups = changes.filter(({ previous, next }) => (previous !== null && isVisualGroup(previous)) || (next !== null && isVisualGroup(next)));

  const nodeIdToParentGroupIdMap: Record<string, string> = {};
  for (const { previous, next } of groups) {
    if (previous !== null && next === null) {
      // Entity removed
      actions.removeGroups([previous.identifier]);
      continue;
    }

    if (next === null) {
      continue;
    }
    const nextVisualGroup = next as VisualGroup;        // Have to cast, even though we know the type
    const group = createGroupNode(nextVisualGroup);

    if (previous === null) {
      // Create new entity.
      actions.addGroups([{ group, content: nextVisualGroup.content }], false);
      nextVisualGroup.content.forEach(nodeIdGroupId => {
        nodeIdToParentGroupIdMap[nodeIdGroupId] = group.identifier;
      });
    }
    else {          // Change of existing - occurs when removing node from canvas
      actions.setGroup(group, nextVisualGroup.content);
    }
  }

  const visualDiagramNodesChanges: {
    created: VisualModelDiagramNode[],
    updated: {
      previous: VisualEntity,
      next: VisualDiagramNode,
    }[],
    removed: VisualEntity[],
  } = {
    created: [],
    updated: [],
    removed: [],
  };

  for (const { previous, next } of changes) {
    if (next !== null) {
      // New or changed entity.
      if(isVisualDiagramNode(next)) {
        let group: string | null = null;
        if (nodeIdToParentGroupIdMap[next.identifier] !== undefined) {
          group = nodeIdToParentGroupIdMap[next.identifier];
        }

        const node = createVisualModelDiagramNode(
          options, aggregatorView.getAvailableVisualModels(), visualModel, next, group);
        if (previous === null) {
          // Create new entity.
          visualDiagramNodesChanges.created.push(node);
          actions.addNodes([node]);
        } else {
          // Change of existing.
          visualDiagramNodesChanges.updated.push({previous, next});
          actions.updateNodes([node]);
        }
      } else if (isVisualNode(next)) {
        const entity = entities[next.representedEntity]?.aggregatedEntity ?? null;

        if (!isSemanticModelClass(entity)
          && !isSemanticModelClassUsage(entity)
          && !isSemanticModelClassProfile(entity)) {
          LOG.error(
            "In visual update semantic entity is not class/usage/profile.",
            { entity, visual: next });
          continue;
        }

        const model = findSourceModelOfEntity(entity.id, models);
        if (model === null) {
          LOG.error("Ignored entity for missing model.", { entity });
          continue;
        }

        let group: string | null = null;
        if (nodeIdToParentGroupIdMap[next.identifier] !== undefined) {
          group = nodeIdToParentGroupIdMap[next.identifier];
        }

        const node = createDiagramNode(
          options, visualModel,
          relationships, relationshipsUsages, relationshipsProfiles, profilingSources,
          next, entity, model, group);

        if (previous === null) {
          // Create new entity.
          actions.addNodes([node]);
        } else {
          // Change of existing.
          actions.updateNodes([node]);
        }

      } else if (isVisualRelationship(next)) {
        const entity = entities[next.representedRelationship]?.aggregatedEntity ?? null;

        const isRelationship =
          isSemanticModelRelationship(entity) ||
          isSemanticModelRelationshipUsage(entity) ||
          isSemanticModelGeneralization(entity) ||
          isSemanticModelRelationshipProfile(entity);
        if (!isRelationship) {
          console.error("In visual update semantic entity is not a relationship.", { entity, visual: next });
          continue;
        }

        const model = findSourceModelOfEntity(entity.id, models);
        if (model === null) {
          console.error("Ignored entity for missing model.", { entity });
          continue;
        }

        const edge = createDiagramEdge(
          options, visualModel, profilingSources, next, entity);

        if (edge === null) {
          console.error("In visual update created edge is null.", { entity, visual: next });
          continue;
        }

        if (previous === null) {
          // Create new entity.
          actions.addEdges([edge]);
        } else {
          // Change of existing.
          actions.updateEdges([edge]);
        }

      } else if (isVisualProfileRelationship(next)) {
        const entity = entities[next.entity]?.aggregatedEntity ?? null;

        const profiled: EntityDsIdentifier[] = [];
        if (isSemanticModelClassUsage(entity)) {
          profiled.push(entity.usageOf);
        } else if (isSemanticModelClassProfile(entity)) {
          profiled.push(...entity.profiling);
        } else {
          console.error("Ignored profile relation as entity is not a usage or a profile.", { entity, visualEntity: next });
          continue;
        }

        // We can have multiple candidates, but we can add only the one represented
        // by the VisualProfileRelationship.
        const edgesToAdd = [];
        const edgesToUpdate = [];

        const edge = createDiagramEdgeForClassUsageOrProfile(visualModel, next, entity);
        if (edge === null) {
          console.error("Ignored null edge.", {visualEntity: next, entity});
          break;
        }
        if (previous === null) {
          edgesToAdd.push(edge);
        } else {
          edgesToUpdate.push(edge);
        }

        if(edgesToAdd.length > 0) {
          // Create new entities.
          actions.addEdges(edgesToAdd);
        }
        if(edgesToUpdate.length > 0) {
          // Change of existing.
          actions.updateEdges(edgesToUpdate);
        }
      } else {
        // We ignore other properties.
      }
    }
    // ...
    if (previous !== null && next === null) {
      // Entity removed
      if (isVisualNode(previous)) {
        actions.removeNodes([previous.identifier]);
      } else if (isVisualRelationship(previous) || isVisualProfileRelationship(previous)) {
        actions.removeEdges([previous.identifier]);
      } else if(isVisualDiagramNode(previous)) {
        actions.removeNodes([previous.identifier]);
        visualDiagramNodesChanges.removed.push(previous);
      } else {
        // We ignore other properties.
      }
    }
  }
}
