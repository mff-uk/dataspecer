import {
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import type {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { type Entity, type EntityModel } from "@dataspecer/core-v2/entity-model";

import { EntityRow } from "./entity-row";
import { sourceModelOfEntity } from "../../util/model-utils";
import { useModelGraphContext } from "../../context/model-context";
import { useClassesContext } from "../../context/classes-context";
import { hasBothEndsOnCanvas, isAnAttribute, isAnEdge } from "../../util/relationship-utils";
import { findSourceModelOfEntity } from "../../service/model-service";

export const RowHierarchy = (props: {
    entity: SemanticModelClass | SemanticModelClassUsage | SemanticModelRelationship | SemanticModelRelationshipUsage;
    handlers: {
        handleAddEntityToActiveView: (entity: Entity) => void;
        handleRemoveEntityFromActiveView: (entityId: string) => void;
        handleExpansion: (model: EntityModel, classId: string) => Promise<void>;
        handleRemoval: (model: InMemorySemanticModel | ExternalSemanticModel, entityId: string) => Promise<void>;
        handleTargeting: (entityId: string) => void;
    };
    indent: number;
    /**
     * List of entities represented on canvas.
     */
    onCanvas: string[];
}) => {
    const { models, aggregatorView } = useModelGraphContext();
    const { profiles, classes, allowedClasses } = useClassesContext();
    const { entity } = props;

    const sourceModel = sourceModelOfEntity(entity.id, [...models.values()]);

    const isAttribute = isAnAttribute(entity);
    const isEdge = isAnEdge(entity);

    const expansionHandler =
        isSemanticModelClass(entity) && sourceModel instanceof ExternalSemanticModel
            ? {
                toggleHandler: () => props.handlers.handleExpansion(sourceModel, entity.id),
                expanded: () => allowedClasses.includes(entity.id),
            }
            : null;

    const drawingHandler =
        isAttribute ||
            (isEdge && !hasBothEndsOnCanvas(entity, aggregatorView.getActiveVisualModel()))
            ? null
            : {
                addToViewHandler: () => props.handlers.handleAddEntityToActiveView(entity),
                removeFromViewHandler: () => props.handlers.handleRemoveEntityFromActiveView(entity.id),
            };

    const removalHandler =
        sourceModel instanceof InMemorySemanticModel || sourceModel instanceof ExternalSemanticModel
            ? { remove: () => props.handlers.handleRemoval(sourceModel, entity.id) }
            : null;

    const thisEntityProfiles = profiles.filter((p) => p.usageOf == entity.id);

    const targetHandler = {
        centerViewportOnEntityHandler: () => props.handlers.handleTargeting(entity.id),
        isTargetable: props.onCanvas.includes(entity.id) && !isAttribute && !isEdge,
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
