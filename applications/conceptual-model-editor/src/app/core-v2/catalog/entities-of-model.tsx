import { useEffect, useMemo, useState } from "react";
import type { EntityModel } from "@dataspecer/core-v2/entity-model";
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
import { CanvasContext } from "../context/canvas-context";
import { useClassesContext } from "../context/classes-context";
import { useModelGraphContext } from "../context/model-context";
import { AddConceptRow } from "../components/catalog-rows/add-concept-row";
import { InputEntityRow } from "../components/catalog-rows/input-row";
import { useModelEntitiesList } from "../components/catalog-rows/model-entities-header";
import { RowHierarchy } from "../components/catalog-rows/row-hierarchy";
import { getCurrentVisibilityOnCanvas } from "../util/canvas-utils";
import { getModelDetails } from "../util/model-utils";
import { compareMaps } from "../util/utils";
import { useDialogsContext } from "../context/dialogs-context";

const getEntitiesToShow = (
    entityType: "class" | "relationship" | "attribute" | "profile",
    model: EntityModel
): (SemanticModelClass | SemanticModelRelationship | SemanticModelClassUsage | SemanticModelRelationshipUsage)[] => {
    if (entityType == "class") {
        return Object.values(model.getEntities()).filter(isSemanticModelClass);
    } else if (entityType == "relationship") {
        return Object.values(model.getEntities())
            .filter(isSemanticModelRelationship)
            .filter((e) => !isSemanticModelAttribute(e));
    } else if (entityType == "attribute") {
        return Object.values(model.getEntities()).filter(isSemanticModelAttribute);
    } else {
        return Object.values(model.getEntities()).filter(
            (e): e is SemanticModelClassUsage | SemanticModelRelationshipUsage =>
                isSemanticModelClassUsage(e) || isSemanticModelRelationshipUsage(e)
        );
    }
};

export const EntitiesOfModel = (props: {
    model: EntityModel;
    entityType: "class" | "relationship" | "attribute" | "profile";
}) => {
    const { model, entityType } = props;

    const { profiles, allowedClasses, setAllowedClasses, deleteEntityFromModel } = useClassesContext();
    const { aggregatorView, models } = useModelGraphContext();
    const { openCreateClassDialog } = useDialogsContext();
    const { ModelEntitiesList } = useModelEntitiesList(model);

    const { id: modelId } = useMemo(() => getModelDetails(model), [model]);
    const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);

    const entities = getEntitiesToShow(entityType, model);

    const localGetCurrentVisibilityOnCanvas = () => {
        const entitiesAndProfiles = [...getEntitiesToShow(entityType, model), ...profiles];
        const onCanvas = new Map(getCurrentVisibilityOnCanvas(entitiesAndProfiles, activeVisualModel));
        // console.trace(
        //     "in localGetCurrentVisibilityOnCanvas",
        //     onCanvas,
        //     entities,
        //     profiles,
        //     activeVisualModel,
        //     entitiesAndProfiles,
        //     modelId
        // );
        return onCanvas;
    };

    const [visibleOnCanvas, setVisibleOnCanvas] = useState(
        new Map<string, boolean>(localGetCurrentVisibilityOnCanvas())
    );

    useEffect(() => {
        console.log("entities-of-model, use-effect: ", activeVisualModel, modelId);
        setVisibleOnCanvas(() => {
            return localGetCurrentVisibilityOnCanvas();
        });

        // TODO: visibility not shown after loading in dev mode

        const getDefaultVisibility = () => {
            if (entityType == "class") {
                return false;
            } else {
                return true;
            }
        };

        const visibilityListenerUnsubscribe = activeVisualModel?.subscribeToChanges((updated, removed) => {
            setVisibleOnCanvas((prev) => {
                const localMap = new Map(prev);
                for (const visualEntityId of removed) {
                    localMap.delete(visualEntityId);
                }
                for (const [_, visualEntity] of Object.entries(updated)) {
                    localMap.set(visualEntity.sourceEntityId, visualEntity.visible ?? getDefaultVisibility());
                }

                const areSame = compareMaps(localMap, prev);
                if (areSame) {
                    // console.log("keeping visibility the same, prev, local ", prev, localMap, modelId);
                    return prev;
                }
                // console.log("changing visibility, prev, local", prev, localMap, modelId);
                return localMap;
            });
        });

        return () => {
            setVisibleOnCanvas(new Map());
            visibilityListenerUnsubscribe?.();
        };
    }, [activeVisualModel]);

    // console.log("entities of model rerendered");

    const toggleAllow = async (model: EntityModel, classId: string) => {
        if (!(model instanceof ExternalSemanticModel)) return;

        if (allowedClasses.includes(classId)) {
            setAllowedClasses(allowedClasses.filter((allowed) => allowed !== classId));
            await model.releaseClassSurroundings(classId);
        } else {
            setAllowedClasses([...allowedClasses, classId]);
            await model.allowClassSurroundings(classId);
        }
    };

    const handleAddConcept = (model: InMemorySemanticModel) => {
        openCreateClassDialog(model);
    };

    const handleAddEntityToActiveView = (entityId: string) => {
        const updateStatus = activeVisualModel?.updateEntity(entityId, { visible: true });
        if (!updateStatus) {
            activeVisualModel?.addEntity({ sourceEntityId: entityId });
        }
    };

    const handleRemoveEntityFromActiveView = (entityId: string) => {
        const updateStatus = activeVisualModel?.updateEntity(entityId, { visible: false });
        if (!updateStatus) {
            activeVisualModel?.addEntity({ sourceEntityId: entityId, visible: false });
        }
    };

    const handleRemoval = (model: InMemorySemanticModel | ExternalSemanticModel, entityId: string) => {
        if (model instanceof InMemorySemanticModel) {
            deleteEntityFromModel(model, entityId);
        } else {
            model.releaseClass(entityId);
        }
    };

    const getAppendedRow = () => {
        if (model instanceof ExternalSemanticModel && entityType == "class") {
            return (
                <InputEntityRow
                    key={modelId + "input row"}
                    onClickHandler={(search: string) => {
                        const callback = async () => {
                            const result = await model.search(search);
                            for (const cls of result) {
                                await model.allowClass(cls.id);
                            }
                            console.log(result);
                        };
                        callback();
                    }}
                />
            );
        } else if (model instanceof InMemorySemanticModel && entityType == "class") {
            return <AddConceptRow key={modelId + "add-concept-row"} onClick={() => handleAddConcept(model)} />;
        }
        return <></>;
    };

    const entityToRowHierarchy = (
        entity:
            | SemanticModelClass
            | SemanticModelRelationship
            | SemanticModelClassUsage
            | SemanticModelRelationshipUsage
    ) => (
        <RowHierarchy
            key={entity.id}
            entity={entity}
            indent={0}
            handlers={{
                handleAddEntityToActiveView,
                handleRemoveEntityFromActiveView,
                handleExpansion: toggleAllow,
                handleRemoval,
            }}
        />
    );

    return (
        <>
            <CanvasContext.Provider value={{ visibleOnCanvas, setVisibleOnCanvas }}>
                <ModelEntitiesList>{entities.map(entityToRowHierarchy).concat(getAppendedRow())}</ModelEntitiesList>
            </CanvasContext.Provider>
        </>
    );
};
