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
import { useCreateUsageDialog, UsageDialogSupportedTypes } from "../dialog/create-usage-dialog";
import { SemanticModelClassUsage, isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { sourceModelOfEntity } from "../util/model-utils";

export const EntitiesOfModel = (props: { model: EntityModel }) => {
    const { classes, allowedClasses, setAllowedClasses, deleteEntityFromModel, usages } = useClassesContext();
    const { aggregatorView, createEntityUsage } = useModelGraphContext();
    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();
    const { isModifyEntityDialogOpen, ModifyEntityDialog, openModifyEntityDialog } = useModifyEntityDialog();
    const { isCreateClassDialogOpen, CreateClassDialog, openCreateClassDialog } = useCreateClassDialog();
    const { isCreateUsageDialogOpen, CreateUsageDialog, openCreateUsageDialog } = useCreateUsageDialog();

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
    const modelId = model.getId();
    let clses: JSX.Element[];

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

    const handleOpenDetail = (cls: SemanticModelClass | SemanticModelClassUsage) => {
        openEntityDetailDialog(cls);
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

    const handleOpenModification = (model: InMemorySemanticModel, cls: SemanticModelClass) => {
        openModifyEntityDialog(cls, model);
    };

    const handleCreateUsage = (entity: UsageDialogSupportedTypes) => {
        openCreateUsageDialog(entity);
    };

    const RowHierarchy = (props: { entity: SemanticModelClass | SemanticModelClassUsage; indent: number }) => {
        const modificationHandler =
            model instanceof InMemorySemanticModel
                ? { openModificationHandler: () => handleOpenModification(model, props.entity) }
                : null;
        return (
            <>
                <EntityRow
                    offset={props.indent}
                    entity={props.entity}
                    key={props.entity.id + activeVisualModel?.getId() + classesLength}
                    expandable={null}
                    openDetailHandler={() => handleOpenDetail(props.entity)}
                    modifiable={modificationHandler}
                    drawable={{
                        addToViewHandler: () => handleAddClassToActiveView(props.entity.id),
                        removeFromViewHandler: () => handleRemoveClassFromActiveView(props.entity.id),
                        isVisibleOnCanvas: () => activeVisualModel?.getVisualEntity(props.entity.id)?.visible ?? false,
                    }}
                    removable={null}
                    // {{
                    //     remove: () => {
                    //         deleteEntityFromModel(model, clsId);
                    //     },
                    // }}
                    usage={
                        isSemanticModelClass(props.entity)
                            ? {
                                  createUsageHandler: () => {
                                      handleCreateUsage(props.entity);
                                  },
                              }
                            : null
                    }
                />
                {usages
                    .filter((u) => u.usageOf == props.entity.id)
                    .filter((u): u is SemanticModelClassUsage => isSemanticModelClassUsage(u))
                    .map((u) => (
                        <RowHierarchy entity={u} indent={props.indent + 1} />
                    ))}
            </>
        );
    };

    const classesLength = classes.size;
    if (model instanceof ExternalSemanticModel) {
        clses = [...classes.entries()]
            .filter(([_, cwo]) => cwo.origin == modelId)
            .map(([clsId, cwo]) => (
                // expandable-row, e.g. slovník.gov.cz
                <EntityRow
                    entity={cwo.cls}
                    key={clsId + activeVisualModel?.getId() + classesLength}
                    expandable={{
                        toggleHandler: () => toggleAllow(model, clsId),
                        expanded: () => allowedClasses.includes(clsId),
                    }}
                    openDetailHandler={() => handleOpenDetail(cwo.cls)}
                    modifiable={null}
                    drawable={{
                        addToViewHandler: () => handleAddClassToActiveView(clsId),
                        removeFromViewHandler: () => handleRemoveClassFromActiveView(clsId),
                        isVisibleOnCanvas: () => activeVisualModel?.getVisualEntity(clsId)?.visible ?? false,
                    }}
                    removable={null}
                    usage={{
                        createUsageHandler: () => {
                            handleCreateUsage(cwo.cls);
                        },
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
        clses = [...classes.entries()]
            .filter(([_, cwo]) => cwo.origin == model.getId())
            .filter(([_, cwo]) => cwo.origin == model.getId())
            .map(([clsId, cwo]) => (
                // modifiable-row, e.g. local
                <RowHierarchy entity={cwo.cls} indent={0} />
            ))
            // <EntityRow
            //     entity={cwo.cls}
            //     key={clsId + activeVisualModel?.getId() + classesLength}
            //     expandable={null}
            //     openDetailHandler={() => handleOpenDetail(cwo.cls)}
            //     modifiable={{ openModificationHandler: () => handleOpenModification(model, cwo.cls) }}
            //     drawable={{
            //         addToViewHandler: () => handleAddClassToActiveView(clsId),
            //         removeFromViewHandler: () => handleRemoveClassFromActiveView(clsId),
            //         isVisibleOnCanvas: () => activeVisualModel?.getVisualEntity(clsId)?.visible ?? false,
            //     }}
            //     removable={{
            //         remove: () => {
            //             deleteEntityFromModel(model, clsId);
            //         },
            //     }}
            //     usage={{
            //         createUsageHandler: () => {
            //             handleCreateUsage(cwo.cls);
            //         },
            //     }}
            // />

            .concat(
                <div key="add-a-concept-" className="flex flex-row justify-between whitespace-nowrap">
                    Add a concept
                    <button className="ml-2 bg-teal-300 px-1" onClick={() => handleAddConcept(model)}>
                        Add
                    </button>
                </div>
            );
    } else {
        clses = [...classes.values()]
            .filter((v) => v.origin == model.getId())
            .map((v) => (
                // non-expandable, e.g. dcat
                <EntityRow
                    entity={v.cls}
                    key={v.cls.id + activeVisualModel?.getId() + classesLength}
                    expandable={null}
                    openDetailHandler={() => openEntityDetailDialog(v.cls)}
                    modifiable={null}
                    drawable={{
                        addToViewHandler: () => handleAddClassToActiveView(v.cls.id),
                        removeFromViewHandler: () => handleRemoveClassFromActiveView(v.cls.id),
                        isVisibleOnCanvas: () => activeVisualModel?.getVisualEntity(v.cls.id)?.visible ?? false,
                    }}
                    removable={null}
                    usage={{
                        createUsageHandler: () => {
                            handleCreateUsage(v.cls);
                        },
                    }}
                />
            ));
    }

    return (
        <>
            <li key={modelId} style={{ backgroundColor: tailwindColorToHex(backgroundColor) }}>
                <div className="flex flex-row justify-between">
                    <h4>Ⓜ {shortenStringTo(modelId)}</h4>
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
                {isOpen && <ul className="ml-1">{clses}</ul>}
            </li>
            {isEntityDetailDialogOpen && <EntityDetailDialog />}
            {isModifyEntityDialogOpen && <ModifyEntityDialog />}
            {isCreateClassDialogOpen && <CreateClassDialog />}
            {isCreateUsageDialogOpen && <CreateUsageDialog />}
        </>
    );
};
