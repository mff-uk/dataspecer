import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useClassesContext } from "../context/classes-context";
import { useModelGraphContext } from "../context/model-context";
import { useCreateProfileDialog } from "../dialog/create-profile-dialog";
import { useEntityDetailDialog } from "../dialog/entity-detail-dialog";
import { EntityRow } from "./entity-catalog-row";
import { useModifyEntityDialog } from "../dialog/modify-entity-dialog";
import {
    SemanticModelClass,
    SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { tailwindColorToHex } from "~/app/utils/color-utils";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

export const AttributeCatalog = () => {
    const { attributes, deleteEntityFromModel, sourceModelOfEntityMap } = useClassesContext();
    const { models, aggregatorView } = useModelGraphContext();
    const { isEntityDetailDialogOpen, openEntityDetailDialog, EntityDetailDialog } = useEntityDetailDialog();
    const {
        isCreateProfileDialogOpen: isCreateUsageDialogOpen,
        openCreateProfileDialog: openCreateUsageDialog,
        CreateProfileDialog: CreateUsageDialog,
    } = useCreateProfileDialog();
    const { isModifyEntityDialogOpen, openModifyEntityDialog, ModifyEntityDialog } = useModifyEntityDialog();

    const handleOpenModification = (
        model: InMemorySemanticModel,
        entity:
            | SemanticModelClass
            | SemanticModelClassUsage
            | SemanticModelRelationship
            | SemanticModelRelationshipUsage
    ) => {
        openModifyEntityDialog(entity, model);
    };

    return (
        <>
            <ul>
                {attributes.map((v) => {
                    const model = models.get(sourceModelOfEntityMap.get(v.id) ?? "");
                    let removeHandler: { remove: () => void } | null = null;
                    let modifyHandler: { openModificationHandler: () => void } | null = null;
                    if (model instanceof InMemorySemanticModel) {
                        removeHandler = {
                            remove: () => {
                                deleteEntityFromModel(model, v.id);
                            },
                        };
                        if (
                            isSemanticModelClass(v) ||
                            isSemanticModelClassUsage(v) ||
                            isSemanticModelRelationshipUsage(v)
                        ) {
                            modifyHandler = {
                                openModificationHandler: () => {
                                    openModifyEntityDialog(v, model);
                                },
                            };
                        }
                    }

                    const color =
                        (model && aggregatorView.getActiveVisualModel()?.getColor(model.getId())) ?? "#ffffff";

                    return (
                        <div style={{ backgroundColor: tailwindColorToHex(color) }}>
                            <EntityRow
                                entity={v}
                                expandable={null}
                                openDetailHandler={() => openEntityDetailDialog(v)}
                                modifiable={modifyHandler}
                                drawable={null}
                                removable={removeHandler}
                                profile={{
                                    createProfileHandler: () => openCreateUsageDialog(v),
                                }}
                            />
                            {/* TODO: use RowHierarchy instead of EntityRow directly 
                            
                            <RowHierarchy
                                entity={v}
                                indent={0}
                                handlers={{
                                    handleOpenDetail: () => openEntityDetailDialog(v),
                                    handleAddClassToActiveView: ,
                                    handleCreateUsage: () => openCreateUsageDialog(v),
                                    handleOpenModification,
                                    handleRemoveClassFromActiveView,
                                    handleExpansion: toggleAllow,
                                    handleRemoval,
                                }}
                            /> */}
                        </div>
                    );
                })}
            </ul>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isCreateUsageDialogOpen && <CreateUsageDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}
        </>
    );
};

export const RelationshipCatalog = () => {
    const { relationships, sourceModelOfEntityMap, deleteEntityFromModel } = useClassesContext();
    const { models, aggregatorView } = useModelGraphContext();
    const { isEntityDetailDialogOpen, openEntityDetailDialog, EntityDetailDialog } = useEntityDetailDialog();
    const {
        isCreateProfileDialogOpen: isCreateUsageDialogOpen,
        openCreateProfileDialog: openCreateUsageDialog,
        CreateProfileDialog: CreateUsageDialog,
    } = useCreateProfileDialog();
    const { isModifyEntityDialogOpen, openModifyEntityDialog, ModifyEntityDialog } = useModifyEntityDialog();

    return (
        <>
            <ul>
                {relationships.map((r) => {
                    const sourceModel = models.get(sourceModelOfEntityMap.get(r.id) ?? "");
                    let removeHandler: { remove: () => void } | null = null;
                    let modifyHandler: { openModificationHandler: () => void } | null = null;
                    if (sourceModel instanceof InMemorySemanticModel) {
                        removeHandler = {
                            remove: () => {
                                deleteEntityFromModel(sourceModel, r.id);
                            },
                        };
                        if (
                            isSemanticModelClass(r) ||
                            isSemanticModelClassUsage(r) ||
                            isSemanticModelRelationshipUsage(r)
                        ) {
                            modifyHandler = {
                                openModificationHandler: () => {
                                    openModifyEntityDialog(r, sourceModel);
                                },
                            };
                        }
                    }

                    const color =
                        (sourceModel && aggregatorView.getActiveVisualModel()?.getColor(sourceModel.getId())) ??
                        "#ffffff";
                    return (
                        <div style={{ backgroundColor: tailwindColorToHex(color) }}>
                            <EntityRow
                                entity={r}
                                expandable={null}
                                openDetailHandler={() => openEntityDetailDialog(r)}
                                modifiable={modifyHandler}
                                drawable={null}
                                removable={removeHandler}
                                profile={{
                                    createProfileHandler: () => openCreateUsageDialog(r),
                                }}
                            />
                            {/* TODO: use RowHierarchy instead of EntityRow directly  */}
                        </div>
                    );
                })}
            </ul>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isCreateUsageDialogOpen && <CreateUsageDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}
        </>
    );
};
