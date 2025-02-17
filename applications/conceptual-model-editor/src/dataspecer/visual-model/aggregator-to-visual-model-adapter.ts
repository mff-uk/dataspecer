import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isVisualNode, isVisualProfileRelationship, isVisualRelationship, VisualNode, VisualProfileRelationship, VisualRelationship, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { getDomainAndRangeConcepts } from "../../util/relationship-utils";
import { createLogger } from "../../application";
import { EntityDsIdentifier } from "../entity-model";

const LOG = createLogger(import.meta.url);

/**
 * Propagate changes from aggregator to visual model.
 */
export function synchronizeOnAggregatorChange(
  visualModel: WritableVisualModel,
  changedItems: AggregatedEntityWrapper[],
  removed: string[],
): void {
  synchronizeUpdates(visualModel, changedItems);
  synchronizeRemoved(visualModel, removed);
}

function synchronizeUpdates(
  visualModel: WritableVisualModel,
  changedItems: AggregatedEntityWrapper[],
): void {
  for (const item of changedItems) {
    const visuals = visualModel.getVisualEntitiesForRepresented(item.id);
    for(const visual of visuals) {
      // We decide based on the type.
      if (isVisualNode(visual)) {
        updateVisualNode(visualModel, item, visual);
      } else if (isVisualRelationship(visual)) {
        updateVisualRelationship(visualModel, item, visual);
      } else if (isVisualProfileRelationship(visual)) {
        updateVisualProfileRelationship(visualModel, item, visual);
      } else {
        // We just ignore all rest.
        break;
      }
    }
  }
}

function updateVisualNode(
  _visualModel: WritableVisualModel,
  _changed: AggregatedEntityWrapper,
  _visual: VisualNode,
): void {
  // There is no change that would apply to visual node.
}

function updateVisualRelationship(
  visualModel: WritableVisualModel,
  changed: AggregatedEntityWrapper,
  visual: VisualRelationship,
): void {
  // What may changed are the ends of the relationship.
  const entity = changed.aggregatedEntity;

  // The entity must be relationship or a relationship profile.
  if (!isSemanticModelRelationship(entity)
    && !isSemanticModelRelationshipUsage(entity)) {
    visualModel.deleteVisualEntity(visual.identifier);
    LOG.invalidEntity(
      entity?.id ?? "",
      "Expected relationship or relationship profile.",
      { entity });
    return;
  }

  // Get domain and range.
  const { domain, range } = getDomainAndRangeConcepts(entity);
  console.log("ENTITY", entity, {domain, range});
  if (domain === null || range === null) {
    visualModel.deleteVisualEntity(visual.identifier);
    LOG.invalidEntity(
      entity?.id ?? "",
      "Missing domain or range for aggregated entity.",
      { entity });
    return;
  }

  // Check there is a source and a target.
  const visualSources = visualModel.getVisualEntitiesForRepresented(domain);
  const visualTargets = visualModel.getVisualEntitiesForRepresented(range);
  if (visualSources.length === 0 || visualTargets.length === 0) {
    visualModel.deleteVisualEntity(visual.identifier);
    return;
  }

  for(const visualSource of visualSources) {
    for(const visualTarget of visualTargets) {
      if (visual.visualSource === visualSource.identifier
        && visual.visualTarget === visualTarget.identifier) {
        // There was no change.
        continue;
      }

      // Update.
      visualModel.updateVisualEntity(visual.identifier, {
        visualSource: visualSource.identifier,
        visualTarget: visualTarget.identifier,
      });
    }
  }

}

function updateVisualProfileRelationship(
  visualModel: WritableVisualModel,
  changed: AggregatedEntityWrapper,
  visual: VisualProfileRelationship,
): void {
  const entity = changed.aggregatedEntity;
  if (isSemanticModelClassUsage(entity)) {
    updateVisualProfileRelationshipForEnds(
      visualModel, entity.id, entity.usageOf, visual);
  } else if (isSemanticModelRelationshipUsage(entity)) {
    updateVisualProfileRelationshipForEnds(
      visualModel, entity.id, entity.usageOf, visual);
  }
}

function updateVisualProfileRelationshipForEnds(
  visualModel: WritableVisualModel,
  profiled: EntityDsIdentifier,
  profile: EntityDsIdentifier,
  visual: VisualProfileRelationship,
): void {
  const visualSources = visualModel.getVisualEntitiesForRepresented(profiled);
  const visualTargets = visualModel.getVisualEntitiesForRepresented(profile);
  if (visualSources.length === 0 || visualTargets.length === 0) {
    visualModel.deleteVisualEntity(visual.identifier);
    return;
  }

  for(const visualSource of visualSources) {
    for(const visualTarget of visualTargets) {
      if (visual.visualSource === visualSource.identifier
        && visual.visualTarget === visualTarget.identifier) {
        // There was no change.
        continue;
      }

      // Update.
      visualModel.updateVisualEntity(visual.identifier, {
        visualSource: visualSource.identifier,
        visualTarget: visualTarget.identifier,
      });
    }
  }
}

function synchronizeRemoved(
  visualModel: WritableVisualModel,
  removed: string[],
): void {
  for (const identifier of removed) {
    const visuals = visualModel.getVisualEntitiesForRepresented(identifier);
    for(const visual of visuals) {
      visualModel.deleteVisualEntity(visual.identifier);
    }
  }
}
