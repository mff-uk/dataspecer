import { isVisualRelationship, VisualModel, WritableVisualModel, VisualRelationship } from "@dataspecer/core-v2/visual-model";
import { getVisualDiagramNodeMappingsByRepresented } from "./utilities";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ClassesContextType } from "@/context/classes-context";
import { getDomainAndRangeConceptsIncludingGeneralizations } from "@/util/relationship-utils";
import { findSourceModelOfEntity } from "@/service/model-service";
import { VisualModelDiagramNode } from "@/diagram";


export function addAllRelationshipsForVisualDiagramNodeToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  classesContext: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  visualModelDiagramNode: VisualModelDiagramNode,
) {
  const allRelationships = [
    ...classesContext.generalizations,
    ...classesContext.relationships,
    ...classesContext.relationshipProfiles,
  ];

  const availableVisualModels: VisualModel[] = graph.aggregatorView.getAvailableVisualModels();

  const visualRelationshipsToAdd: Omit<VisualRelationship, "identifier" | "type">[] = [];

  const representedVisualModel = availableVisualModels.find(model => model.getIdentifier() === visualModelDiagramNode.externalIdentifier);
  if (representedVisualModel === undefined) {
    notifications.error("Missing referenced visual model");
    return;
  }
  const { classToVisualDiagramNodeMappingRaw } = getVisualDiagramNodeMappingsByRepresented(availableVisualModels, visualModel);

  console.info({classToVisualDiagramNodeMappingRaw});
  for (const cclass of Object.keys(classToVisualDiagramNodeMappingRaw)) {
    // Go through all semantic relationships
    for (const relationship of allRelationships) {
      const { domain, range } = getDomainAndRangeConceptsIncludingGeneralizations(relationship);

      // If domain is in the visual model diagram node
      if (domain === cclass) {
        if (range === null) {
          continue;
        }
        const possibleRanges = visualModel.getVisualEntitiesForRepresented(range);
        const visualRelationships = visualModel.getVisualEntitiesForRepresented(relationship.id);
        for (const visualRelationship of visualRelationships) {
          if (!isVisualRelationship(visualRelationship)) {
            continue;
          }
          if (visualRelationship.visualSource !== visualModelDiagramNode.identifier) {
            continue;
          }

          const index = possibleRanges.findIndex(possibleRange => possibleRange.identifier === visualRelationship.visualTarget)
          if(index === -1) {
            continue;
          }
          possibleRanges.splice(index, 1);
        }
        const model = findSourceModelOfEntity(relationship.id, graph.models);
        if (model === null) {
          continue;
        }
        for (const visualRange of possibleRanges) {
          const visualRelationship: Omit<VisualRelationship, "identifier" | "type"> = {
            representedRelationship: relationship.id,
            model: model?.getId(),
            waypoints: [],
            visualSource: visualModelDiagramNode.identifier,
            visualTarget: visualRange.identifier,
          }

          visualRelationshipsToAdd.push(visualRelationship);
        }
      }

      // TODO RadStr: Same as the above
      if (range === cclass) {
        if (domain === null) {
          continue;
        }
        const possibleDomains = visualModel.getVisualEntitiesForRepresented(domain);
        const visualRelationships = visualModel.getVisualEntitiesForRepresented(relationship.id);
        for (const visualRelationship of visualRelationships) {
          if (!isVisualRelationship(visualRelationship)) {
            continue;
          }
          if (visualRelationship.visualTarget !== visualModelDiagramNode.identifier) {
            continue;
          }

          const index = possibleDomains.findIndex(possibleDomain => possibleDomain.identifier === visualRelationship.visualSource)
          if(index === -1) {
            continue;
          }
          possibleDomains.splice(index, 1);
        }

        const model = findSourceModelOfEntity(relationship.id, graph.models);
        if (model === null) {
          continue;
        }
        for (const visualDomain of possibleDomains) {
          const visualRelationship: Omit<VisualRelationship, "identifier" | "type"> = {
            representedRelationship: relationship.id,
            model: model?.getId(),
            waypoints: [],
            visualSource: visualDomain.identifier,
            visualTarget: visualModelDiagramNode.identifier,
          }

          visualRelationshipsToAdd.push(visualRelationship);
        }
      }

    }
  }

  // We don't need visual profile relationships actually, sicne currently we always show them
  // (when validating model they are shown)
  for (const visualRelationshipToAdd of visualRelationshipsToAdd) {
    visualModel.addVisualRelationship(visualRelationshipToAdd)
  }

}

export function addAllRelationshipsForClassToVisualModel(

) {

}
