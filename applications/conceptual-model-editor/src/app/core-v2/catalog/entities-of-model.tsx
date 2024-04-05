import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { useEffect, useState } from "react";
import { useClassesContext } from "../context/classes-context";
import { shortenStringTo } from "../util/utils";
import { EntityRow, InputEntityRow } from "./entity-catalog-row";
import { useModelGraphContext } from "../context/model-context";
import {
    SemanticModelClass,
    SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useEntityDetailDialog } from "../dialog/entity-detail-dialog";
import { useModifyEntityDialog } from "../dialog/modify-entity-dialog";
import { ColorPicker } from "../util/color-picker";
import { randomColorFromPalette, tailwindColorToHex } from "~/app/utils/color-utils";
import { useCreateClassDialog } from "../dialog/create-class-dialog";
import { useCreateProfileDialog, ProfileDialogSupportedTypes } from "../dialog/create-profile-dialog";
import { SemanticModelClassUsage, isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { sourceModelOfEntity } from "../util/model-utils";
import { RowHierarchy } from "./row-hierarchy";

export const EntitiesOfModel = (props: { model: EntityModel }) => {
    const { classes, classes2, allowedClasses, setAllowedClasses, profiles, deleteEntityFromModel } =
        useClassesContext();
    const { aggregatorView, models } = useModelGraphContext();
    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();
    const { isModifyEntityDialogOpen, ModifyEntityDialog, openModifyEntityDialog } = useModifyEntityDialog();
    const { isCreateClassDialogOpen, CreateClassDialog, openCreateClassDialog } = useCreateClassDialog();
    const { isCreateProfileDialogOpen, CreateProfileDialog, openCreateProfileDialog } = useCreateProfileDialog();

    const [isOpen, setIsOpen] = useState(true);
    const { model } = props;
    const activeVisualModel = aggregatorView.getActiveVisualModel();
    const [backgroundColor, setBackgroundColor] = useState(activeVisualModel?.getColor(model.getId()) || "#000001");

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
    }, [activeVisualModel]);

    const modelId = model.getId();
    let clses: JSX.Element[];

    const modelDisplayName = model.getAlias() ?? shortenStringTo(modelId);

    const toggleAllow = async (model: EntityModel, classId: string) => {
        console.log("in toggle allow", aggregatorView, model, classId, allowedClasses);
        if (!(model instanceof ExternalSemanticModel)) return;

        if (allowedClasses.includes(classId)) {
            console.log("in toggle allow, removing from allowed classes");
            setAllowedClasses(allowedClasses.filter((allowed) => allowed !== classId));
            await model.releaseClassSurroundings(classId);
        } else {
            console.log("in toggle allow, adding to allowed classes");
            setAllowedClasses([...allowedClasses, classId]);
            await model.allowClassSurroundings(classId);
        }
    };

    const handleOpenDetail = (entity: SemanticModelClass | SemanticModelClassUsage | SemanticModelRelationship) => {
        openEntityDetailDialog(entity);
    };

    const handleAddConcept = (model: InMemorySemanticModel) => {
        openCreateClassDialog(model);
    };

    const handleAddClassToActiveView = (classId: string) => {
        const updateStatus = activeVisualModel?.updateEntity(classId, { visible: true });
        if (!updateStatus) {
            activeVisualModel?.addEntity({ sourceEntityId: classId });
        }
    };

    const handleRemoveClassFromActiveView = (classId: string) => {
        activeVisualModel?.updateEntity(classId, { visible: false });
    };

    const handleOpenModification = (
        model: InMemorySemanticModel,
        cls: SemanticModelClass | SemanticModelClassUsage
    ) => {
        openModifyEntityDialog(cls, model);
    };

    const handleCreateUsage = (entity: ProfileDialogSupportedTypes) => {
        openCreateProfileDialog(entity);
    };

    const handleRemoval = (model: InMemorySemanticModel, entityId: string) => {
        deleteEntityFromModel(model, entityId);
    };

    if (model instanceof ExternalSemanticModel) {
        clses = classes2
            .filter((v) => sourceModelOfEntity(v.id, [model]) /* v.origin == model.getId() */)
            .map((v) => (
                <RowHierarchy
                    entity={v}
                    indent={0}
                    handlers={{
                        handleOpenDetail,
                        handleAddClassToActiveView,
                        handleCreateUsage,
                        handleOpenModification,
                        handleRemoveClassFromActiveView,
                        handleExpansion: toggleAllow,
                        handleRemoval,
                    }}
                />
            ))
            .concat(
                <InputEntityRow
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
    } else if (model instanceof InMemorySemanticModel) {
        clses =
            // [...classes.entries()]
            //     .filter(([_, cwo]) => cwo.origin == model.getId())
            // .map(([clsId, cwo]) => (
            classes2
                .filter((v) => sourceModelOfEntity(v.id, [model]) /* v.origin == model.getId() */)
                .map((v) => (
                    // modifiable-row, e.g. local
                    <RowHierarchy
                        entity={v}
                        indent={0}
                        handlers={{
                            handleOpenDetail,
                            handleAddClassToActiveView,
                            handleCreateUsage,
                            handleOpenModification,
                            handleRemoveClassFromActiveView,
                            handleExpansion: toggleAllow,
                            handleRemoval,
                        }}
                    />
                ))
                .concat(
                    <div key="add-a-concept-" className="flex flex-row justify-between whitespace-nowrap">
                        Add a concept
                        <button className="ml-2 bg-teal-300 px-1" onClick={() => handleAddConcept(model)}>
                            Add
                        </button>
                    </div>
                );
    } else {
        clses = classes2
            .filter((v) => sourceModelOfEntity(v.id, [model]) /* v.origin == model.getId() */)
            .map((v) => (
                // non-expandable, e.g. dcat
                <RowHierarchy
                    entity={v}
                    indent={0}
                    handlers={{
                        handleOpenDetail,
                        handleAddClassToActiveView,
                        handleCreateUsage,
                        handleOpenModification,
                        handleRemoveClassFromActiveView,
                        handleExpansion: toggleAllow,
                        handleRemoval,
                    }}
                />
            ));
    }

    return (
        <>
            <li key={modelId} style={{ backgroundColor: tailwindColorToHex(backgroundColor) }}>
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
                        <button onClick={() => setIsOpen((prev) => !prev)}>{isOpen ? "🔼" : "🔽"}</button>
                    </div>
                </div>
                {isOpen && <ul className="ml-1">{clses}</ul>}
            </li>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}
            {isCreateClassDialogOpen && <CreateClassDialog />}
            {isCreateProfileDialogOpen && <CreateProfileDialog />}
        </>
    );
};
