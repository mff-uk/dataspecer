import { useEffect, useMemo } from "react";

import {
  type SemanticModelClass,
  type SemanticModelGeneralization,
  type SemanticModelRelationship,
  isSemanticModelAttribute,
  isSemanticModelClass,
  isSemanticModelGeneralization,
  isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  type SemanticModelClassUsage,
  type SemanticModelRelationshipUsage,
  isSemanticModelAttributeUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import {
  type VisualEntity,
  VisualGroup,
  type VisualModel,
  type VisualNode,
  type VisualProfileRelationship,
  type VisualRelationship,
  VisualSuperNode,
  isVisualGroup,
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
  isVisualSuperNode,
  isWritableVisualModel,
} from "@dataspecer/core-v2/visual-model";
import {
  type SemanticModelAggregatorView,
} from "@dataspecer/core-v2/semantic-model/aggregator";

import { type UseModelGraphContextType, useModelGraphContext } from "./context/model-context";
import { type UseClassesContextType, useClassesContext } from "./context/classes-context";
import { cardinalityToHumanLabel, DomainAndRange, getDomainAndRange } from "./util/relationship-utils";
import { useActions } from "./action/actions-react-binding";
import { Diagram, type Edge, EdgeType, Group, type EntityItem, type Node, DiagramSuperNode } from "./diagram/";
import { type UseDiagramType } from "./diagram/diagram-hook";
import { logger } from "./application";
import { getDescriptionLanguageString, getFallbackDisplayName, getNameLanguageString, getUsageNoteLanguageString } from "./util/name-utils";
import { getLocalizedStringFromLanguageString } from "./util/language-utils";
import { getIri, getModelIri } from "./util/iri-utils";
import { findSourceModelOfEntity } from "./service/model-service";
import { type EntityModel } from "@dataspecer/core-v2";
import { Options, useOptions } from "./application/options";
import { getGroupMappings, getNodesAndSuperNodesFromVisualModelRecursively, getSuperNodeMappings } from "./action/utilities";
import { synchronizeOnAggregatorChange } from "./dataspecer/visual-model/aggregator-to-visual-model-adapter";

const DEFAULT_MODEL_COLOR = "#ffffff";

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

    const unsubscribeSemanticAggregatorCallback = aggregatorView.subscribeToChanges((updated, removed) => {
      console.log("[VISUALIZATION] SemanticModelAggregatorView.subscribeToChanges", { updated, removed });
      if (isWritableVisualModel(activeVisualModel)) {
        synchronizeOnAggregatorChange(activeVisualModel, updated, removed);
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
    logger.warn("Visual model change is ignored as visual model is not ready! This should not happen.");
    return;
  }
  if (diagram === null || !diagram.areActionsReady) {
    logger.warn("Visual model change is ignored as the diagram is not ready!");
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
    logger.warn("Visual model change is ignored as the diagram is not ready!");
    return;
  }
  if (visualModel === null) {
    // We just set content to nothing and return.
    void diagram.actions().setContent([], [], []);
    return;
  }

  const models = graphContext.models;
  const entities = aggregatorView.getEntities();
  const attributes = classesContext.relationships.filter(isSemanticModelAttribute);
  const attributeProfiles = classesContext.profiles.filter(isSemanticModelAttributeUsage);

  const profilingSources = [...classesContext.classes, ...classesContext.relationships, ...classesContext.profiles];

  const nextNodes: (Node | DiagramSuperNode)[] = [];
  const nextEdges: Edge[] = [];
  const nextGroups: VisualGroup[] = [];
  const visualEntities = visualModel.getVisualEntities().values();
  const { nodeToGroupMapping } = getGroupMappings(visualModel);
  const { nodeToSuperNodeMapping } = getSuperNodeMappings(aggregatorView.getAvailableVisualModels(), visualModel);
  console.info("nodeToSuperNodeMapping", {nodeToSuperNodeMapping, visNodes: [...visualModel.getVisualEntities().values()].filter(isVisualNode)});
  console.info("nodeToSuperNodeMapping", {nodeToSuperNodeMapping, visualEntities: [...visualModel.getVisualEntities().values()]});

  for (const visualEntity of visualEntities) {
    if(isVisualSuperNode(visualEntity)) {
      if(nodeToSuperNodeMapping[visualEntity.visualModels[0]] !== undefined) {
        continue;
      }

      const node = createDiagramSuperNode(
        options,
        aggregatorView.getAvailableVisualModels(), visualModel,
        visualEntity,
        nodeToGroupMapping[visualEntity.identifier] ?? null);
      nextNodes.push(node);
    } else if(isVisualGroup(visualEntity)) {
      nextGroups.push(visualEntity);
      continue;
    } else if (isVisualNode(visualEntity)) {
      const entity = entities[visualEntity.representedEntity]?.aggregatedEntity ?? null;
      if (isSemanticModelClassUsage(entity) || isSemanticModelClass(entity)) {
        if(nodeToSuperNodeMapping[visualEntity.representedEntity] !== undefined) {
          continue;
        }

        const model = findSourceModelOfEntity(entity.id, models);
        if (model === null) {
          console.error("Ignored entity for missing model.", { entity });
          continue;
        }

        const node = createDiagramNode(
          options, visualModel,
          attributes, attributeProfiles, profilingSources,
          visualEntity, entity, model, nodeToGroupMapping[visualEntity.identifier] ?? null);
        nextNodes.push(node);
      }
    } else if (isVisualRelationship(visualEntity)) {
      const entity = entities[visualEntity.representedRelationship]?.aggregatedEntity ?? null;
      const isRelationship =
                isSemanticModelRelationship(entity) ||
                isSemanticModelRelationshipUsage(entity) ||
                isSemanticModelGeneralization(entity);
      if (isRelationship) {
        const model = findSourceModelOfEntity(entity.id, models);
        if (model === null) {
          console.error("Ignored entity for missing model.", { entity });
          continue;
        }
        const edge = createDiagramEdge(
          options, visualModel, profilingSources, visualEntity, entity, nodeToSuperNodeMapping);
        if (edge !== null) {
          nextEdges.push(edge);
        }
      }
    } else if (isVisualProfileRelationship(visualEntity)) {
      const entity = entities[visualEntity.entity]?.aggregatedEntity ?? null;
      if (!isSemanticModelClassUsage(entity)) {
        console.error("Ignored profile relation as entity is not a profile.", { entity });
        continue;
      }
      const model = findSourceModelOfEntity(entity.id, models);
      if (model === null) {
        console.error("Ignored entity for missing model.", { entity });
        continue;
      }
      const profileOf = visualModel.getVisualEntityForRepresented(entity.usageOf);
      if (profileOf === null) {
        console.error("Missing profile for profile relation.", { entity });
        continue;
      }
      const edge = createDiagramEdgeForClassProfile(visualModel, visualEntity, entity, nodeToSuperNodeMapping);
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
  diagram.actions().setContent(nextNodes, nextEdges, groupsToSetContentWith);
}

function createGroupNode(
  visualGroup: VisualGroup,
): Group {
  return {
    identifier: visualGroup.identifier,
  };
}

function createDiagramNode(
  options: Options,
  visualModel: VisualModel,
  attributes: SemanticModelRelationship[],
  attributesProfiles: SemanticModelRelationshipUsage[],
  profilingSources: (SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelClass)[],
  visualNode: VisualNode,
  entity: SemanticModelClass | SemanticModelClassUsage,
  model: EntityModel,
  group: string | null,
): Node {
  const language = options.language;

  // Put into Record so we can later easily set the order of items based on visualNode.content
  // (since I was lazy - the idea itself is based on ChatGPT's response)
  const itemsAsRecord: Record<string, EntityItem> = {};
  for(const attribute of attributes) {
    if(isSemanticModelAttribute(attribute) && visualNode.content.includes(attribute.id)) {
      itemsAsRecord[attribute.id] = {
        identifier: attribute.id,
        label: getEntityLabel(language, attribute),
        profileOf: null,
      };
    }
  }

  for(const attributeProfile of attributesProfiles) {
    if(isSemanticModelAttributeUsage(attributeProfile) && visualNode.content.includes(attributeProfile.id)) {
      const profileOf =
            (isSemanticModelClassUsage(attributeProfile) || isSemanticModelRelationshipUsage(attributeProfile)
              ? profilingSources.find((e) => e.id === attributeProfile.usageOf)
              : null
            ) ?? null;

      itemsAsRecord[attributeProfile.id] = {
        identifier: attributeProfile.id,
        label: getEntityLabel(language, attributeProfile),
        profileOf: profileOf === null ? null : {
          label: getEntityLabel(language, profileOf),
          usageNote: getUsageNote(language, attributeProfile),
        },
      };
    }
  }

  // We filter undefined values, because the update of the semantic attributes comes later
  // so there is moment when the content of visual node is set but the corresponding
  // attributes semantic model in are not.
  // Also it is safety measure if there is some inconsistency in models.
  const items: EntityItem[] = visualNode.content.map(id => itemsAsRecord[id]).filter(item => item !== undefined);

  const profileOf =
        (isSemanticModelClassUsage(entity) || isSemanticModelRelationshipUsage(entity)
          ? profilingSources.find((e) => e.id === entity.usageOf)
          : null
        ) ?? null;

  return {
    identifier: visualNode.identifier,
    externalIdentifier: entity.id,
    label: getEntityLabel(language, entity),
    iri: getIri(entity, getModelIri(model)),
    color: visualModel.getModelColor(visualNode.model) ?? DEFAULT_MODEL_COLOR,
    description: getEntityDescription(language, entity),
    group,
    position: {
      x: visualNode.position.x,
      y: visualNode.position.y,
    },
    profileOf: profileOf === null ? null : {
      label: getEntityLabel(language, profileOf),
      usageNote: getUsageNote(language, entity),
    },
    items: items,
  };
}

function createDiagramSuperNode(
  options: Options,
  availableVisualModels: VisualModel[],
  sourceVisualModel: VisualModel,
  visualSuperNode: VisualSuperNode,
  group: string | null,
): DiagramSuperNode {
  const containedNodes = getNodesAndSuperNodesFromVisualModelRecursively(availableVisualModels, visualSuperNode.visualModels[0]);
  const referencedVisualModel = availableVisualModels.find(availableVisualModel => availableVisualModel.getIdentifier() === visualSuperNode.visualModels[0]);
  let referencedVisualModelLabel = referencedVisualModel === undefined ?
    "" :
    getLocalizedStringFromLanguageString(referencedVisualModel.getLabel(), options.language);
  if(referencedVisualModelLabel === null) {
    referencedVisualModelLabel = "Visual model node";
  }
  console.info("containedNodes", containedNodes);
  return {
    identifier: visualSuperNode.identifier,
    externalIdentifier: visualSuperNode.identifier,
    representedModelAlias: referencedVisualModelLabel,
    label: getLocalizedStringFromLanguageString(visualSuperNode.label, options.language) ?? referencedVisualModelLabel,
    color: sourceVisualModel.getModelColor(visualSuperNode.model) ?? DEFAULT_MODEL_COLOR,
    description: getLocalizedStringFromLanguageString(visualSuperNode.description, options.language) ?? referencedVisualModelLabel,
    group,
    position: {
      x: visualSuperNode.position.x,
      y: visualSuperNode.position.y,
    },
    profileOf: null,
    items: [],
    containedNodes,
  };

// TODO RadStr: Old code
  // return {
  //   identifier: visualNode.identifier,
  //   externalIdentifier: entity.id,
  //   label: getEntityLabel(language, entity),
  //   iri: getIri(entity, getModelIri(model)),
  //   color: visualModel.getModelColor(visualNode.model) ?? DEFAULT_MODEL_COLOR,
  //   description: getEntityDescription(language, entity),
  //   group,
  //   position: {
  //     x: visualNode.position.x,
  //     y: visualNode.position.y,
  //   },
  //   profileOf: profileOf === null ? null : {
  //     label: getEntityLabel(language, profileOf),
  //     usageNote: getUsageNote(language, entity),
  //   },
  //   items: items,
  // };
}

function getEntityLabel(
  language: string,
  entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelGeneralization
) {
  return getLocalizedStringFromLanguageString(getNameLanguageString(entity), language)
        ?? getFallbackDisplayName(entity) ?? "";
}

function getEntityDescription(
  language: string,
  entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelGeneralization) {
  return getLocalizedStringFromLanguageString(getDescriptionLanguageString(entity), language);
}

function getUsageNote(
  language: string,
  entity: SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelGeneralization) {
  return getLocalizedStringFromLanguageString(getUsageNoteLanguageString(entity), language);
}

function createDiagramEdge(
  options: Options,
  visualModel: VisualModel,
  profilingSources: (SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelClass)[],
  visualRelationship: VisualRelationship,
  entity: SemanticModelRelationship | SemanticModelRelationshipUsage | SemanticModelGeneralization,
  nodeToSuperNodeMapping: Record<string, string>,
): Edge | null {
  const identifier = entity.id;
  if (isSemanticModelRelationship(entity)) {
    return createDiagramEdgeForRelationship(
      options, visualModel, profilingSources, visualRelationship, entity, nodeToSuperNodeMapping);
  } else if (isSemanticModelRelationshipUsage(entity)) {
    return createDiagramEdgeForRelationshipProfile(
      options, visualModel, profilingSources, visualRelationship, entity, nodeToSuperNodeMapping);
  } else if (isSemanticModelGeneralization(entity)) {
    return createDiagramEdgeForGeneralization(
      visualModel, visualRelationship, entity, nodeToSuperNodeMapping);
  }
  throw Error(`Unknown entity type ${identifier}.`);
}

// TODO RadStr: Remove
// function getVisualSourceAndTargetForEdge(
//   visualModel: VisualModel,
//   visualRelationship: VisualRelationship | VisualProfileRelationship,
//   nodeToSuperNodeMapping: Record<string, string>,
// ) {
//   const source = findVisualEndForEdge(visualModel, visualRelationship.visualSource, nodeToSuperNodeMapping);
//   const target = findVisualEndForEdge(visualModel, visualRelationship.visualTarget, nodeToSuperNodeMapping);
//   return {source, target};
// }

// function findVisualEndForEdge(
//   visualModel: VisualModel,
//   visualRelationshipEnd: string,
//   nodeToSuperNodeMapping: Record<string, string>,
// ): string {
//   const node = visualModel.getVisualEntity(visualRelationshipEnd);
//   let visualEnd;
//   if(node !== null && isVisualNode(node)) {
//     if(nodeToSuperNodeMapping[node.representedEntity]) {
//       alert("DEBUG - moved edge");
//     }
//     visualEnd = nodeToSuperNodeMapping[node.representedEntity] ?? visualRelationshipEnd;
//   }
//   else {
//     visualEnd = visualRelationshipEnd;
//   }

//   return visualEnd;
// }

function createDiagramEdgeForRelationship(
  options: Options,
  visualModel: VisualModel,
  profilingSources: (SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelClass)[],
  visualRelationship: VisualRelationship,
  entity: SemanticModelRelationship,
  nodeToSuperNodeMapping: Record<string, string>,
): Edge {
  const language = options.language;

  const profileOf =
        (isSemanticModelRelationshipUsage(entity)
          ? profilingSources.find((e) => e.id === entity.usageOf)
          : null
        ) ?? null;

  const { domain, range } = getDomainAndRange(entity);

  // TODO RadStr: Remove later - commented code
  // const { source, target } = getVisualSourceAndTargetForEdge(
  //   visualModel, visualRelationship, nodeToSuperNodeMapping);

  return {
    type: EdgeType.Association,
    identifier: visualRelationship.identifier,
    externalIdentifier: entity.id,
    label: getEntityLabel(language, entity),
    source: visualRelationship.visualSource,
    cardinalitySource: cardinalityToHumanLabel(domain?.cardinality),
    target: visualRelationship.visualTarget,
    cardinalityTarget: cardinalityToHumanLabel(range?.cardinality),
    color: visualModel.getModelColor(visualRelationship.model) ?? DEFAULT_MODEL_COLOR,
    waypoints: visualRelationship.waypoints,
    profileOf: profileOf === null ? null : {
      label: getEntityLabel(language, profileOf),
      usageNote: getUsageNote(language, entity),
    },
  };
}

function createDiagramEdgeForRelationshipProfile(
  options: Options,
  visualModel: VisualModel,
  profilingSources: (SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage | SemanticModelClass)[],
  visualRelationship: VisualRelationship,
  entity: SemanticModelRelationshipUsage,
  nodeToSuperNodeMapping: Record<string, string>,
): Edge {
  const language = options.language;

  const profileOf =
        (isSemanticModelRelationshipUsage(entity)
          ? profilingSources.find((e) => e.id === entity.usageOf)
          : null
        ) ?? null;

  const { domain, range } = getDomainAndRange(entity);

  // TODO RadStr: Remove later - commented code
  // const { source, target } = getVisualSourceAndTargetForEdge(
  //   visualModel, visualRelationship, nodeToSuperNodeMapping);

  return {
    type: EdgeType.Association,
    identifier: visualRelationship.identifier,
    externalIdentifier: entity.id,
    label: "<<profile>>\n" + getEntityLabel(language, entity),
    source: visualRelationship.visualSource,
    cardinalitySource: cardinalityToHumanLabel(domain?.cardinality),
    target: visualRelationship.visualTarget,
    cardinalityTarget: cardinalityToHumanLabel(range?.cardinality),
    color: visualModel.getModelColor(visualRelationship.model) ?? DEFAULT_MODEL_COLOR,
    waypoints: visualRelationship.waypoints,
    profileOf: profileOf === null ? null : {
      label: getEntityLabel(language, profileOf),
      usageNote: getUsageNote(language, entity),
    },
  };
}

function createDiagramEdgeForGeneralization(
  visualModel: VisualModel,
  visualGeneralization: VisualRelationship,
  entity: SemanticModelGeneralization,
  nodeToSuperNodeMapping: Record<string, string>,
): Edge {
  // TODO RadStr: Remove later - commented code
  // const { source, target } = getVisualSourceAndTargetForEdge(
  //   visualModel, visualGeneralization, nodeToSuperNodeMapping);

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

function createDiagramEdgeForClassProfile(
  visualModel: VisualModel,
  classProfileVisualEdge: VisualProfileRelationship,
  entity: SemanticModelClassUsage,
  nodeToSuperNodeMapping: Record<string, string>,
): Edge | null {

  // TODO RadStr: Remove later - commented code
  // const { source, target } = getVisualSourceAndTargetForEdge(
  //   visualModel, classProfileVisualEdge, nodeToSuperNodeMapping);

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
    logger.warn("Visual entities change is ignored as the diagram is not ready!");
    return;
  }
  if (visualModel === null) {
    // We just set content to nothing and return.
    void diagram.actions().setContent([], [], []);
    return;
  }

  const models = graphContext.models;
  const entities = aggregatorView.getEntities();
  const attributes = classesContext.relationships.filter(isSemanticModelAttribute);
  const attributeProfiles = classesContext.profiles.filter(isSemanticModelAttributeUsage);

  const profilingSources = [...classesContext.classes, ...classesContext.relationships, ...classesContext.profiles];

  const actions = diagram.actions();

  const groups = changes.filter(({previous, next}) => (previous !== null && isVisualGroup(previous)) || (next !== null && isVisualGroup(next)));

  const nodeIdToParentGroupIdMap: Record<string, string> = {};
  for(const {previous, next} of groups) {
    if (previous !== null && next === null) {
      // Entity removed
      actions.removeGroups([previous.identifier]);
      continue;
    }

    if(next === null) {
      continue;
    }
    const nextVisualGroup = next as VisualGroup;        // Have to cast, even though we know the type
    const group = createGroupNode(nextVisualGroup);

    if (previous === null) {
      // Create new entity.
      actions.addGroups([{group, content: nextVisualGroup.content}], false);
      nextVisualGroup.content.forEach(nodeIdGroupId => {
        nodeIdToParentGroupIdMap[nodeIdGroupId] = group.identifier;
      });
    }
    else {          // Change of existing - occurs when removing node from canvas
      actions.setGroup(group, nextVisualGroup.content);
    }
  }

  // TODO RadStr: Not used variables and debug
  console.info("!!!entities", visualModel.getVisualEntities());
  console.info("!!!changes", changes);
  console.info("!!!getSuperNodeMappings", getSuperNodeMappings(aggregatorView.getAvailableVisualModels(), visualModel));
  const { existingSuperNodes, nodeToSuperNodeMapping } = getSuperNodeMappings(aggregatorView.getAvailableVisualModels(), visualModel);
  const superNodes = changes.filter(({previous, next}) => (previous !== null && isVisualSuperNode(previous)) || (next !== null && isVisualSuperNode(next)));
  const superNodesChanges: {
    created: DiagramSuperNode[],
    updated: {
      previous: VisualEntity,
      next: VisualSuperNode,
    }[],
    removed: VisualEntity[],
  } = {
    created: [],
    updated: [],
    removed: [],
  };

  // TODO RadStr:
  // for(const {previous, next} of superNodes) {
  //   if (previous !== null && next === null) {
  //     // Entity removed
  //     actions.removeGroups([previous.identifier]);
  //     continue;
  //   }

  //   if(next === null) {
  //     continue;
  //   }
  //   // const nextVisualGroup = next as VisualGroup;        // Have to cast, even though we know the type
  //   // const group = createGroupNode(nextVisualGroup);


  //   // TODO RadStr: Null just for now
  //   const node = createDiagramSuperNode(
  //     options, visualModel,
  //     next as VisualSuperNode,
  //     null);
  //   if (previous === null) {
  //     // Create new entity.
  //     // actions.addGroups([{group, content: nextVisualGroup.content}], false);
  //     // nextVisualGroup.content.forEach(nodeIdGroupId => {
  //     //   nodeIdToParentGroupIdMap[nodeIdGroupId] = group.identifier;

  //     // const node = createDiagramSuperNode(
  //     //   options, visualModel,
  //     //   next as VisualSuperNode,
  //     //   nodeToGroupMapping[visualEntity.identifier] ?? null);
  //     actions.addNodes([node]);
  //   }
  //   else {          // Change of existing - occurs when removing node from canvas
  //     actions.updateNodes([node]);
  //   }
  // }
  // if(superNodes.length > 0) {
  //   alert("TEST");
  // }

  for (const { previous, next } of changes) {
    if (next !== null) {
      // New or changed entity.
      if(isVisualSuperNode(next)) {
        // TODO RadStr: Null just for now
        const node = createDiagramSuperNode(
          options, aggregatorView.getAvailableVisualModels(), visualModel, next as VisualSuperNode, null);
        if (previous === null) {
          // Create new entity.
          superNodesChanges.created.push(node);
          actions.addNodes([node]);
        } else {
          // Change of existing.
          superNodesChanges.updated.push({previous, next});
          actions.updateNodes([node]);
        }
      } else if (isVisualNode(next)) {
        if(nodeToSuperNodeMapping[next.representedEntity] !== undefined) {
          return;
        }

        const entity = entities[next.representedEntity]?.aggregatedEntity ?? null;

        if (!isSemanticModelClass(entity) && !isSemanticModelClassUsage(entity)) {
          console.error("In visual update semantic entity is not class or class usage.", { entity, visual: next });
          continue;
        }

        const model = findSourceModelOfEntity(entity.id, models);
        if (model === null) {
          console.error("Ignored entity for missing model.", { entity });
          continue;
        }

        let group: string | null = null;
        if(nodeIdToParentGroupIdMap[next.identifier] !== undefined) {
          group = nodeIdToParentGroupIdMap[next.identifier];
        }

        const node = createDiagramNode(
          options, visualModel,
          attributes, attributeProfiles, profilingSources,
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
                    isSemanticModelGeneralization(entity);
        if (!isRelationship) {
          console.error("In visual update semantic entity is not a relationship.", { entity, visual: next });
          continue;
        }

        const model = findSourceModelOfEntity(entity.id, models);
        if (model === null) {
          console.error("Ignored entity for missing model.", { entity });
          continue;
        }


        // TODO RadStr: DEBUG
        console.info("Changing EDGE", {nodeToSuperNodeMapping, previous, next});
        const edge = createDiagramEdge(options, visualModel, profilingSources, next, entity, nodeToSuperNodeMapping);

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

        if (!isSemanticModelClassUsage(entity)) {
          console.error("In visual update semantic entity is not a profile.", { entity, visual: next });
          continue;
        }

        const profileOf = visualModel.getVisualEntityForRepresented(entity.usageOf);
        if (profileOf === null) {
          console.error("Missing profile for profile relation.", { entity });
          continue;
        }

        const edge = createDiagramEdgeForClassProfile(visualModel, next, entity, nodeToSuperNodeMapping);

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
      } else if(isVisualSuperNode(previous)) {
        actions.removeNodes([previous.identifier]);
        superNodesChanges.removed.push(previous);
      } else {
        // We ignore other properties.
      }
    }
  }

  // TODO RadStr: actually probably not needed:

  // if(superNodesChanges.created.length > 0 ||
  //    superNodesChanges.removed.length > 0 ||
  //    superNodesChanges.updated.length > 0
  //   ) {
  //   // Do it the lazy way, instead of updating everything manually.
  //   // This is very rare operation, so we can afford it.
  //   // TODO RadStr: That being said it should be optimized to update only on content change not on position change
  //   onChangeVisualModel(
  //     options, visualModel, diagram,
  //     aggregatorView, classesContext, graphContext
  //   );
  // }
}
