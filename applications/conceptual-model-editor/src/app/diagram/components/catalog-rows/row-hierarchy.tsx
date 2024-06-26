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
import { EntityRow } from "../../components/catalog-rows/entity-catalog-row";
import { sourceModelOfEntity } from "../../util/model-utils";
import { useModelGraphContext } from "../../context/model-context";
import { useClassesContext } from "../../context/classes-context";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import { hasBothEndsOnCanvas, isAnAttribute, isAnEdge } from "../../util/relationship-utils";

export const RowHierarchy = (props: {
    entity: SemanticModelClass | SemanticModelClassUsage | SemanticModelRelationship | SemanticModelRelationshipUsage;
    handlers: {
        handleAddEntityToActiveView: (entityId: string) => void;
        handleRemoveEntityFromActiveView: (entityId: string) => void;
        handleExpansion: (model: EntityModel, classId: string) => Promise<void>;
        handleRemoval: (model: InMemorySemanticModel | ExternalSemanticModel, entityId: string) => Promise<void>;
    };
    indent: number;
}) => {
    const { models, aggregatorView } = useModelGraphContext();
    const { profiles, classes, allowedClasses } = useClassesContext();
    const { entity } = props;

    const sourceModel = sourceModelOfEntity(props.entity.id, [...models.values()]);

    const isAttribute = isAnAttribute(props.entity);

    const expansionHandler =
        isSemanticModelClass(props.entity) && sourceModel instanceof ExternalSemanticModel
            ? {
                  toggleHandler: () => props.handlers.handleExpansion(sourceModel, props.entity.id),
                  expanded: () => allowedClasses.includes(props.entity.id),
              }
            : null;

    const drawingHandler =
        isAttribute ||
        (isAnEdge(entity) && !hasBothEndsOnCanvas(entity, aggregatorView.getActiveVisualModel()?.getVisualEntities()))
            ? null
            : {
                  addToViewHandler: () => props.handlers.handleAddEntityToActiveView(props.entity.id),
                  removeFromViewHandler: () => props.handlers.handleRemoveEntityFromActiveView(props.entity.id),
              };

    const removalHandler =
        sourceModel instanceof InMemorySemanticModel || sourceModel instanceof ExternalSemanticModel
            ? { remove: () => props.handlers.handleRemoval(sourceModel, props.entity.id) }
            : null;

    const thisEntityProfiles = profiles.filter((p) => p.usageOf == props.entity.id);

    // console.log("row hierarchy rerendered", sourceModel?.getId());

    return (
        <>
            <div
                className="flex flex-col"
                style={
                    props.indent > 0 && sourceModel
                        ? { backgroundColor: aggregatorView.getActiveVisualModel()?.getColor(sourceModel?.getId()) }
                        : {}
                }
            >
                <EntityRow
                    offset={props.indent}
                    entity={props.entity}
                    key={
                        props.entity.id +
                        (aggregatorView.getActiveVisualModel()?.getId() ?? "mId") +
                        classes.length.toString()
                    }
                    expandable={expansionHandler}
                    drawable={drawingHandler}
                    removable={removalHandler}
                    sourceModel={sourceModel}
                />
                {thisEntityProfiles.map((p) => (
                    <RowHierarchy
                        key={p.id + entity.id + (aggregatorView.getActiveViewId() ?? "view-id")}
                        entity={p}
                        indent={props.indent + 1}
                        handlers={props.handlers}
                    />
                ))}
            </div>
        </>
    );
};
