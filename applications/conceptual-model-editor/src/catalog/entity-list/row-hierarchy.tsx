import {
  type SemanticModelClass,
  type SemanticModelRelationship,
  isSemanticModelAttribute,
  isSemanticModelClass,
  isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import {
  type SemanticModelClassUsage,
  type SemanticModelRelationshipUsage,
  isSemanticModelAttributeUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { type Entity, type EntityModel } from "@dataspecer/core-v2/entity-model";

import { EntityRow } from "./entity-row";
import { sourceModelOfEntity } from "../../util/model-utils";
import { useModelGraphContext } from "../../context/model-context";
import { useClassesContext } from "../../context/classes-context";
import { hasBothEndsInVisualModel } from "../../util/relationship-utils";
import { findSourceModelOfEntity } from "../../service/model-service";
import { SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

export const RowHierarchy = (props: {
    entity: SemanticModelClass | SemanticModelClassUsage
      | SemanticModelRelationship | SemanticModelRelationshipUsage
      | SemanticModelClassProfile | SemanticModelRelationshipProfile;
    handlers: {
        handleAddEntityToActiveView: (entity: Entity) => void;
        handleRemoveEntityFromActiveView: (entity: Entity) => void;
        handleExpansion: (model: EntityModel, classId: string) => Promise<void>;
        handleRemoval: (model: InMemorySemanticModel | ExternalSemanticModel, entityId: string) => Promise<void>;
        handleTargeting: (entityId: string, entityNumberToBeCentered: number) => void;
    };
    indent: number;
    /**
     * List of entities represented on canvas.
     */
    onCanvas: string[];
}) => {
  const { models, aggregatorView } = useModelGraphContext();
  const { usages, classProfiles, relationshipProfiles, classes, allowedClasses } = useClassesContext();
  const { entity } = props;

  // We need this to get access to ends of the profile.
  const aggregatedEntity = aggregatorView.getEntities()[props.entity.id]?.aggregatedEntity ?? null;

  const sourceModel = sourceModelOfEntity(entity.id, [...models.values()]);

  const isClassOrProfile = isSemanticModelClass(aggregatedEntity) || isSemanticModelClassUsage(aggregatedEntity);
  const isRelationshipOrProfile = isSemanticModelRelationship(aggregatedEntity) || isSemanticModelRelationshipUsage(aggregatedEntity);
  const isAttributeOrAttributeProfile = isSemanticModelAttribute(aggregatedEntity) || isSemanticModelAttributeUsage(aggregatedEntity);

  const expansionHandler =
        isSemanticModelClass(entity) && sourceModel instanceof ExternalSemanticModel
          ? {
            toggleHandler: () => props.handlers.handleExpansion(sourceModel, entity.id),
            expanded: () => allowedClasses.includes(entity.id),
          }
          : null;

  const showDrawingHandler = isClassOrProfile || isAttributeOrAttributeProfile || (isRelationshipOrProfile && hasBothEndsInVisualModel(aggregatedEntity, aggregatorView.getActiveVisualModel()));
  const drawingHandler = !showDrawingHandler ? null : {
    addToViewHandler: () => props.handlers.handleAddEntityToActiveView(entity),
    removeFromViewHandler: () => props.handlers.handleRemoveEntityFromActiveView(entity),
  };

  const removalHandler =
        sourceModel instanceof InMemorySemanticModel || sourceModel instanceof ExternalSemanticModel
          ? { remove: () => props.handlers.handleRemoval(sourceModel, entity.id) }
          : null;

  const thisEntityProfiles = [
    ...usages.filter(item => item.usageOf === entity.id),
    ...classProfiles.filter(item => item.profiling.includes(entity.id)),
    ...relationshipProfiles.filter(item => item.ends.find(end => end.profiling.includes(entity.id)) !== undefined),
  ];

  const targetHandler = {
    centerViewportOnEntityHandler: (entityNumberToBeCentered: number) => 
      props.handlers.handleTargeting(entity.id, entityNumberToBeCentered),
    isTargetable: props.onCanvas.includes(entity.id) || 
                  isSemanticModelAttribute(entity) || 
                  isSemanticModelAttributeUsage(entity),
  };

  const model = findSourceModelOfEntity(entity.id, models);
  if (model === null) {
    console.error("Entity was not rendered as model is null.", { entity });
    return null;
  }

  return (
    <div
      className="flex flex-col"
      style={
        props.indent > 0 && sourceModel
          ? { backgroundColor: aggregatorView.getActiveVisualModel()?.getModelColor(sourceModel?.getId()) ?? "white" }
          : {}
      }
    >
      <EntityRow
        offset={props.indent}
        model={model.getId()}
        entity={entity}
        key={
          entity.id +
                    (aggregatorView.getActiveVisualModel()?.getId() ?? "mId") +
                    classes.length.toString()
        }
        expandable={expansionHandler}
        drawable={drawingHandler}
        removable={removalHandler}
        targetable={targetHandler}
        sourceModel={sourceModel}
        isOnCanvas={props.onCanvas.includes(entity.id)}
      />
      {thisEntityProfiles.map((p) => (
        <RowHierarchy
          key={p.id + entity.id + (aggregatorView.getActiveViewId() ?? "view-id")}
          entity={p}
          indent={props.indent + 1}
          handlers={props.handlers}
          onCanvas={props.onCanvas}
        />
      ))}
    </div>
  );
};
