import { isVisualNode, VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../../context/classes-context";
import { CmeReference, CmeSemanticModel } from "../../../dataspecer/cme-model/model";
import {
  RelationshipRepresentative,
  representOwlThing,
  representRdfsLiteral,
  representRelationshipProfile,
  representRelationships,
  representRelationshipUsages,
} from "../../utilities/dialog-utilities";
import { configuration, createLogger, t } from "../../../application";
import { InvalidState } from "../../../application/error";
import { ModelGraphContextType } from "../../../context/model-context";
import { isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { semanticModelMapToCmeSemanticModel } from "../../../dataspecer/cme-model/adapter";

const LOG = createLogger(import.meta.url);

export interface EditVisualNodeDialogState {

  /**
   * Primary data language for the dialog.
   */
  language: string;

  /**
   * Identifier of the represented entity.
   */
  representedEntity: CmeReference;

  /**
   * Active and visible content.
   */
  activeContent: RelationshipRepresentative[];

  /**
   * Items that can be part of the node content.
   */
  inactiveContent: RelationshipRepresentative[];

}

/**
 * @throws InvalidState
 */
export function createEditVisualNodeState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel,
  visualEntityIdentifier: string,
  language: string,
): EditVisualNodeDialogState {

  const visualNode = visualModel.getVisualEntity(visualEntityIdentifier);
  if (visualNode === null || !isVisualNode(visualNode)) {
    LOG.error("Invalid visual entity.", { identifier: visualEntityIdentifier });
    throw new InvalidState();
  }

  const representedEntity: CmeReference = {
    identifier: visualNode.representedEntity,
    model: visualNode.model,
  };

  const semanticModels = semanticModelMapToCmeSemanticModel(
    graphContext.models, visualModel,
    configuration().defaultModelColor,
    identifier => t("model-service.model-label-from-id", identifier));

  const contentMap: Record<string, RelationshipRepresentative> = {};
  const inactiveContent: RelationshipRepresentative[] = []
  listRelationships(classesContext, graphContext, semanticModels)
    .forEach(item => {
      // Ignore relationships with different domain.
      if (item.domain !== representedEntity.identifier) {
        return;
      }
      // Select where to put it.
      if (visualNode.content.includes(item.identifier)) {
        contentMap[item.identifier] = item;
      } else {
        inactiveContent.push(item);
      }
    });

  const activeContent = visualNode.content
    .map(identifier => contentMap[identifier])
    .filter(item => item !== undefined);

  return {
    language,
    representedEntity,
    inactiveContent,
    activeContent,
  };
}

function listRelationships(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  semanticModels: CmeSemanticModel[],
) {
  const entities = graphContext.aggregatorView.getEntities();
  const models = [...graphContext.models.values()];

  const owlThing = representOwlThing();

  const rdfsLiteral = representRdfsLiteral();

  return [
    ...representRelationships(models, semanticModels,
      classesContext.relationships,
      owlThing.identifier, rdfsLiteral.identifier),
    ...representRelationshipUsages(entities, models, semanticModels,
      classesContext.usages.filter(item => isSemanticModelRelationshipUsage(item)),
      owlThing.identifier, rdfsLiteral.identifier),
    ...representRelationshipProfile(entities, models, semanticModels,
      classesContext.relationshipProfiles)
  ];
}
