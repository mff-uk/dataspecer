import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { useEffect, useMemo, useState } from "react";
import { useClassesContext } from "../context/classes-context";
import { InputEntityRow } from "../components/catalog-rows/input-row";
import { useModelGraphContext } from "../context/model-context";
import {
    SemanticModelClass,
    SemanticModelRelationship,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useEntityDetailDialog } from "../dialog/entity-detail-dialog";
import { useModifyEntityDialog } from "../dialog/modify-entity-dialog";
import { useCreateClassDialog } from "../dialog/create-class-dialog";
import { useCreateProfileDialog, ProfileDialogSupportedTypes } from "../dialog/create-profile-dialog";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getModelDetails, sourceModelOfEntity } from "../util/model-utils";
import { RowHierarchy } from "../components/catalog-rows/row-hierarchy";
import { getCurrentVisibilityOnCanvas } from "../util/canvas-utils";
import { AddConceptRow } from "../components/catalog-rows/add-concept-row";
import { useModelEntitiesList } from "../components/catalog-rows/model-entities-header";
import { CanvasContext } from "../context/canvas-context";
import { compareMaps } from "../util/utils";

const getEntitiesToShow = (entityType: "class" | "relationship" | "attribute" | "profile", model: EntityModel) => {
    const { classes2, relationships, profiles, sourceModelOfEntityMap } = useClassesContext();
    const modelId = model.getId();

    if (entityType == "class") {
        return classes2.filter((v) => sourceModelOfEntityMap.get(v.id) == modelId);
    } else if (entityType == "relationship") {
        return relationships
            .filter((v) => !isSemanticModelAttribute(v))
            .filter((v) => sourceModelOfEntityMap.get(v.id) == modelId);
    } else if (entityType == "attribute") {
        return relationships
            .filter(isSemanticModelAttribute)
            .filter((v) => sourceModelOfEntityMap.get(v.id) == modelId);
    } else {
        // profile
        return profiles.filter((v) => sourceModelOfEntityMap.get(v.id) == modelId);
    }
};

export const EntitiesOfModel = (props: {
    model: EntityModel;
    entityType: "class" | "relationship" | "attribute" | "profile";
}) => {
    const { model, entityType } = props;

    const { profiles, allowedClasses, setAllowedClasses, deleteEntityFromModel } = useClassesContext();
    const { aggregatorView, models } = useModelGraphContext();
    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();
    const { isModifyEntityDialogOpen, ModifyEntityDialog, openModifyEntityDialog } = useModifyEntityDialog();
    const { isCreateClassDialogOpen, CreateClassDialog, openCreateClassDialog } = useCreateClassDialog();
    const { isCreateProfileDialogOpen, CreateProfileDialog, openCreateProfileDialog } = useCreateProfileDialog();

    const { ModelEntitiesList } = useModelEntitiesList(model);

    const { id: modelId } = useMemo(() => getModelDetails(model), [models]);
    const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);

    const entities = getEntitiesToShow(entityType, model);

    const localGetCurrentVisibilityOnCanvas = () => {
        const entitiesAndProfiles = [...entities, ...profiles];
        // console.log("in localGetCurrentVisibilityOnCanvas", activeVisualModel, entitiesAndProfiles, modelId);
        return getCurrentVisibilityOnCanvas(entitiesAndProfiles, activeVisualModel);
    };

    const [visibleOnCanvas, setVisibleOnCanvas] = useState(
        new Map<string, boolean>(localGetCurrentVisibilityOnCanvas())
    );

    useEffect(() => {
        setVisibleOnCanvas(new Map(localGetCurrentVisibilityOnCanvas()));
    }, []);

    useEffect(() => {
        console.log("entities-of-model, use-effect: ", activeVisualModel, modelId);
        setVisibleOnCanvas(() => {
            // console.log("first setting visibility on canvas", activeVisualModel, modelId);
            return new Map(localGetCurrentVisibilityOnCanvas());
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
                for (const visualEntityId in removed) {
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

    const handleOpenDetail = (
        entity:
            | SemanticModelClass
            | SemanticModelClassUsage
            | SemanticModelRelationship
            | SemanticModelRelationshipUsage
    ) => {
        openEntityDetailDialog(entity);
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

    const handleOpenModification = (
        model: InMemorySemanticModel,
        entity:
            | SemanticModelClass
            | SemanticModelRelationship
            | SemanticModelClassUsage
            | SemanticModelRelationshipUsage
    ) => {
        openModifyEntityDialog(entity, model);
    };

    const handleCreateUsage = (entity: ProfileDialogSupportedTypes) => {
        openCreateProfileDialog(entity);
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
                                await model.allowClass(cls.iri!);
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
                handleOpenDetail,
                handleAddEntityToActiveView,
                handleCreateUsage,
                handleOpenModification,
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
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}
            {isCreateClassDialogOpen && <CreateClassDialog />}
            {isCreateProfileDialogOpen && <CreateProfileDialog />}
        </>
    );
};
