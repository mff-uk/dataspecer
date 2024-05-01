import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { useEffect, useState } from "react";
import { useClassesContext } from "../../context/classes-context";
import { shortenStringTo } from "../../util/utils";
import { InputEntityRow } from "./input-row";
import { useModelGraphContext } from "../../context/model-context";
import {
    SemanticModelClass,
    SemanticModelRelationship,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useEntityDetailDialog } from "../../dialog/entity-detail-dialog";
import { useModifyEntityDialog } from "../../dialog/modify-entity-dialog";
import { ColorPicker } from "../../util/color-picker";
import { randomColorFromPalette, tailwindColorToHex } from "~/app/utils/color-utils";
import { useCreateClassDialog } from "../../dialog/create-class-dialog";
import { useCreateProfileDialog, ProfileDialogSupportedTypes } from "../../dialog/create-profile-dialog";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { sourceModelOfEntity } from "../../util/model-utils";
import { RowHierarchy } from "./row-hierarchy";
import { getCurrentVisibilityOnCanvas } from "../../util/canvas-utils";
import { ExpandModelButton } from "./buttons/expand-model";

export const EntitiesOfModel = (props: {
    model: EntityModel;
    entityType: "class" | "relationship" | "attribute" | "profile";
}) => {
    const { classes2, relationships, allowedClasses, setAllowedClasses, profiles, deleteEntityFromModel } =
        useClassesContext();
    const { aggregatorView, models } = useModelGraphContext();
    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();
    const { isModifyEntityDialogOpen, ModifyEntityDialog, openModifyEntityDialog } = useModifyEntityDialog();
    const { isCreateClassDialogOpen, CreateClassDialog, openCreateClassDialog } = useCreateClassDialog();
    const { isCreateProfileDialogOpen, CreateProfileDialog, openCreateProfileDialog } = useCreateProfileDialog();

    const [isOpen, setIsOpen] = useState(true);
    const { model, entityType } = props;
    const activeVisualModel = aggregatorView.getActiveVisualModel();
    const [backgroundColor, setBackgroundColor] = useState(activeVisualModel?.getColor(model.getId()) || "#000001");

    const [modelDisplayName, setModelDisplayName] = useState(model.getAlias() ?? shortenStringTo(model.getId()));

    useEffect(() => {
        console.log("entities of model, models changed");
        const alias = models.get(model.getId())?.getAlias();
        if (alias) {
            setModelDisplayName(alias);
        }
    }, [models]);

    const [entitiesOfModelKey, setEntitiesOfModelKey] = useState(model.getId() + activeVisualModel?.getId());
    const modelId = model.getId();

    let entitySource:
        | SemanticModelClass[]
        | SemanticModelRelationship[]
        | SemanticModelRelationship[]
        | (SemanticModelClassUsage | SemanticModelRelationshipUsage)[];
    if (entityType == "class") {
        entitySource = classes2;
    } else if (entityType == "relationship") {
        entitySource = relationships.filter((v) => !isSemanticModelAttribute(v));
    } else if (entityType == "attribute") {
        entitySource = relationships.filter(isSemanticModelAttribute);
    } else {
        // profile
        entitySource = profiles;
    }

    const entities2 = entitySource.filter((v) => sourceModelOfEntity(v.id, [model]));

    const [visibleOnCanvas, setVisibleOnCanvas] = useState(
        new Map<string, boolean>(getCurrentVisibilityOnCanvas(entities2, activeVisualModel))
    );

    useEffect(() => {
        console.log("entities-of-model, use-effect: ", activeVisualModel, model.getId());
        // fixme: move it elsewhere
        let color = activeVisualModel?.getColor(model.getId());
        if (!color) {
            color = randomColorFromPalette();
            activeVisualModel?.setColor(model.getId(), color);
        }
        //
        setBackgroundColor(color ?? "#ff00ff");

        setVisibleOnCanvas(new Map(getCurrentVisibilityOnCanvas(entities2, activeVisualModel)));

        const getDefaultVisibility = () => {
            if (entityType == "class") {
                return false;
            } else {
                return true;
            }
        };

        const visibilityListenerUnsubscribe = activeVisualModel?.subscribeToChanges((updated, removed) => {
            setVisibleOnCanvas((prev) => {
                for (const visualEntityId in removed) {
                    prev.delete(visualEntityId);
                }
                for (const [entityId, visualEntity] of Object.entries(updated)) {
                    prev.set(visualEntity.sourceEntityId, visualEntity.visible ?? getDefaultVisibility());
                }
                return new Map(prev);
            });
        });

        setEntitiesOfModelKey(model.getId() + activeVisualModel?.getId());

        return () => {
            visibilityListenerUnsubscribe?.();
        };
    }, [activeVisualModel]);

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

    const handleRemoval = (model: InMemorySemanticModel, entityId: string) => {
        deleteEntityFromModel(model, entityId);
    };

    let appendedRow: JSX.Element | null = null;
    if (model instanceof ExternalSemanticModel && entityType == "class") {
        appendedRow = (
            <InputEntityRow
                key={model.getId() + "input row"}
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
        appendedRow = (
            <div key="add-a-concept-" className="flex flex-row justify-between whitespace-nowrap">
                Add a concept
                <button className="ml-2 bg-teal-300 px-1" onClick={() => handleAddConcept(model)}>
                    Add
                </button>
            </div>
        );
    }

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
            visibleOnCanvas={visibleOnCanvas}
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
            <li key={entitiesOfModelKey} style={{ backgroundColor: tailwindColorToHex(backgroundColor) }}>
                <div className="flex flex-row justify-between">
                    <h4>Ⓜ {modelDisplayName}</h4>
                    <div className="flex flex-row">
                        <ColorPicker
                            currentColor={backgroundColor}
                            saveColor={(color) => {
                                console.log(color, activeVisualModel);
                                setBackgroundColor(color);
                                activeVisualModel?.setColor(modelId, color);
                            }}
                        />
                        <ExpandModelButton isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
                    </div>
                </div>
                {isOpen && (
                    <ul id={`infinite-scroll-${modelId}`} className="ml-1" key={"entities" + modelId}>
                        {entities2.map(entityToRowHierarchy).concat(appendedRow ?? <></>)}
                    </ul>
                )}
            </li>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}
            {isCreateClassDialogOpen && <CreateClassDialog />}
            {isCreateProfileDialogOpen && <CreateProfileDialog />}
        </>
    );
};
