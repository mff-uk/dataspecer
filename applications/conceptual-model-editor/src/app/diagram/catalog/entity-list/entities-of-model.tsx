import { useEffect, useMemo, useState } from "react";
import { useReactFlow } from "reactflow";

import type { Entity, EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import {
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelAttribute,
    isSemanticModelClass,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { useClassesContext } from "../../context/classes-context";
import { useModelGraphContext } from "../../context/model-context";
import { AddConceptRow } from "../components/add-concept-row";
import { InputEntityRow } from "../components/input-row";
import { RowHierarchy } from "./row-hierarchy";
import { shortenStringTo } from "../../util/utils";
import { useActions } from "../../action/actions-react-binding";
import { ExpandModelButton } from "../components/expand-model";
import { type VisualEntity, isVisualNode, isVisualRelationship } from "@dataspecer/core-v2/visual-model";

export enum EntityType {
Class = "class",
    Relationship = "relationship",
    Attribute = "attribute",
    Profile = "profile",
}

type EntityTypes = SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage;

const DEFAULT_MODEL_COLOR = "#000069";

/**
 * @returns entities of given type.
 */
const getEntitiesByType = (entityType: EntityType, model: EntityModel): EntityTypes[] => {
    switch (entityType) {
        case EntityType.Class:
            return Object.values(model.getEntities())
                .filter(isSemanticModelClass);
        case EntityType.Relationship:
            return Object.values(model.getEntities())
                .filter(isSemanticModelRelationship)
                .filter((entity) => !isSemanticModelAttribute(entity));
        case EntityType.Attribute:
            return Object.values(model.getEntities())
                .filter(isSemanticModelAttribute);
        case EntityType.Profile:
            return Object.values(model.getEntities())
                .filter(isUsage);
    }
};

const isUsage = (what: Entity | null): what is SemanticModelClassUsage | SemanticModelRelationshipUsage => {
    return isSemanticModelClassUsage(what) || isSemanticModelRelationshipUsage(what);
};

/**
 * Render list of entities of given type for given model.
 */
export const EntitiesOfModel = (props: { model: EntityModel; entityType: EntityType; }) => {
    const { model, entityType } = props;
    //
    const actions = useActions();
    const { allowedClasses, setAllowedClasses, deleteEntityFromModel } = useClassesContext();
    const { aggregatorView } = useModelGraphContext();
    const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);
    // We could utilize Set, but since the list of visible is probably small,
    // this should be fine as well.
    const [listCollapsed, setListCollapsed] = useState(false);
    const [visible, setVisible] = useState<string[]>([]);
    const [color, setColor] = useState(DEFAULT_MODEL_COLOR);
    const reactFlow = useReactFlow<object, object>();

    //

    const entities = getEntitiesByType(entityType, model);

    // TODO Visible must contain represented entities not visual entities!

    /**
     * Initialize.
     */
    useEffect(() => {
        if (activeVisualModel === null) {
            // We need to wait to get the model.
            return;
        }
        // Load what we need from the visual model.
        const nextVisible: string[] = [];
        activeVisualModel.getVisualEntities().forEach(entity => {
            const represented = getRepresented(entity);
            if (represented !== null) {
                nextVisible.push(represented);
            }
        });

        setVisible(nextVisible);
        setColor(activeVisualModel.getModelColor(model.getId()) ?? DEFAULT_MODEL_COLOR);

        // Subscribe to changes, so we can keep the visible list up to date.
        const unsubscribe = activeVisualModel.subscribeToChanges({
            modelColorDidChange(identifier, next) {
                if (identifier === model.getId()) {
                    setColor(next ?? DEFAULT_MODEL_COLOR);
                }
            },
            visualEntitiesDidChange(entities) {
                for (const { previous, next } of entities) {
                    if (previous === null && next !== null) {
                        // Create.
                        const represented = getRepresented(next);
                        if (represented !== null) {
                            setVisible(prev => [...prev, represented]);
                        }
                    } else if (previous !== null && next === null) {
                        // Delete
                        setVisible(prev => {
                            const represented = getRepresented(previous);
                            if (represented === null) {
                                return prev;
                            }
                            const index = prev.indexOf(represented);
                            if (index === -1) {
                                return prev;
                            }
                            return [
                                ...prev.slice(0, index),
                                ...prev.slice(index + 1, prev.length),
                            ];
                        });
                    } else if (previous !== null && next !== null) {
                        // Update
                    }
                }
            },
        });

        return () => {
            setVisible([]);
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeVisualModel, model]);

    /**
     * Add surrounding of an entity to the entity model.
     * This functionality is available only for ExternalSemanticModel.
     */
    const handleExpansion = async (model: EntityModel, identifier: string) => {
        if (!(model instanceof ExternalSemanticModel)) {
            return;
        }
        if (allowedClasses.includes(identifier)) {
            setAllowedClasses(allowedClasses.filter((allowed) => allowed !== identifier));
            await model.releaseClassSurroundings(identifier);
        } else {
            setAllowedClasses([...allowedClasses, identifier]);
            await model.allowClassSurroundings(identifier);
        }
    };

    /**
     * Open dialog to create a new class in given model.
     * The model is in fact this model, so we can remove the argument in the future.
     */
    const handleAddClass = (model: InMemorySemanticModel) => {
        actions.openCreateClassDialog(model);
    };

    const handleAddToView = (identifier: string) => {
        const viewport = reactFlow.getViewport();
        const position = {
            x: viewport.x,
            y: viewport.y,
        };
        actions.addNodeToVisualModel(model.getId(), identifier, position);
    };

    const handleDeleteFromView = (identifier: string) => {
        actions.removeFromVisualModel(identifier);
    };

    const handleDeleteEntity = async (model: InMemorySemanticModel | ExternalSemanticModel, identifier: string) => {
        // TODO Move code to action.
        if (model instanceof InMemorySemanticModel) {
            deleteEntityFromModel(model, identifier);
            actions.removeFromVisualModel(identifier);
        } else {
            await model.releaseClass(identifier);
        }
    };

    const handleSetViewportToEntity = (identifier: string) => {
        // TODO Move code to action.
        if (entityType !== EntityType.Class && entityType !== EntityType.Profile) {
            return;
        }
        const visualEntity = activeVisualModel?.getVisualEntityForRepresented(identifier);
        if (visualEntity === null || visualEntity === undefined) {
            return;
        }
        const node = reactFlow.getNode(visualEntity.identifier);
        if (node !== undefined) {
            reactFlow.fitView({
                nodes: [node],
                duration: 400,
            });
        }
    };

    // Rendering section.
    const displayName = model.getAlias() ?? shortenStringTo(model.getId());
    return (
        <li style={{ backgroundColor: color }}>
            <div className="flex flex-row justify-between">
                <h4>Ⓜ {displayName}</h4>
                <div className="flex flex-row">
                    <ExpandModelButton isOpen={listCollapsed} onClick={() => setListCollapsed(!listCollapsed)} />
                </div>
            </div>
            {listCollapsed ? null : (
                <ul id={`infinite-scroll-${model.getId()}`} className="ml-1">
                    {entities.map((entity: EntityTypes) => (
                        <RowHierarchy
                            key={entity.id}
                            entity={entity}
                            indent={0}
                            handlers={{
                                handleAddEntityToActiveView: handleAddToView,
                                handleRemoveEntityFromActiveView: handleDeleteFromView,
                                handleExpansion,
                                handleRemoval: handleDeleteEntity,
                                handleTargeting: handleSetViewportToEntity,
                            }}
                            onCanvas={visible}
                        />
                    ))}
                    {renderExternalSemanticModelSearch(entityType, model, handleAddClass)}
                </ul>
            )}
        </li>
    );
};

function getRepresented(entity: VisualEntity): string | null {
    if (isVisualNode(entity)) {
        return entity.representedEntity;
    } else if (isVisualRelationship(entity)) {
        return entity.representedRelationship;
    } else {
        return null;
    }
}

/**
 * Render input to add a class.
 * This is search box for ExternalSemanticModel and a "add" button for InMemorySemanticModel.
 */
function renderExternalSemanticModelSearch(type: EntityType, model: EntityModel, onAddClass: (model: InMemorySemanticModel) => void) {
    if (type !== EntityType.Class) {
        return null;
    }
    if (model instanceof ExternalSemanticModel) {

        const onClick = (search: string) => {
            model.search(search)
                .then(async found => {
                    for (const item of found) {
                        // We need to use IRI as ExternalSemanticModel,
                        // or sgov in time of writing, does not support identifier.
                        if (item.iri === null) {
                            continue;
                        }
                        await model.allowClass(item.iri);
                    }
                })
                .catch(console.error);
        };

        return (
            <InputEntityRow onClickHandler={onClick} />
        );
    } else if (model instanceof InMemorySemanticModel) {
        return <AddConceptRow onClick={() => onAddClass(model)} />;
    }
    return null;
}
