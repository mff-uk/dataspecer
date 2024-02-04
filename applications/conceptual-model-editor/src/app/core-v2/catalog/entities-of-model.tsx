import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { useEffect, useState } from "react";
import { useClassesContext } from "../context/classes-context";
import { shortenSemanticModelId } from "../util/utils";
import { ExpandableRow, ModifiableRow, NonExpandableRow } from "./entity-catalog-rows";
import { useModelGraphContext } from "../context/graph-context";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useEntityDetailDialog } from "../dialogs/entity-detail-dialog";
import { getRandomName } from "~/app/utils/random-gen";
import { useModifyEntityDialog } from "../dialogs/modify-entity-dialog";
import { ColorPicker } from "../util/color-picker";
import { tailwindColorToHex } from "~/app/utils/color-utils";

export const EntitiesOfModel = (props: { model: EntityModel }) => {
    const { classes, allowedClasses, setAllowedClasses } = useClassesContext();
    const { aggregatorView, addClassToModel } = useModelGraphContext();
    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();
    const { isModifyEntityDialogOpen, ModifyEntityDialog, openModifyEntityDialog } = useModifyEntityDialog();

    const [isOpen, setIsOpen] = useState(true);
    const { model } = props;
    const activeVisualModel = aggregatorView.getActiveVisualModel();
    const [backgroundColor, setBackgroundColor] = useState(activeVisualModel?.getColor(model.getId()) || "#db6969");

    useEffect(() => {
        console.log("entities-of-model, use-effect: ", activeVisualModel, model.getId());
        setBackgroundColor(activeVisualModel?.getColor(model.getId()) ?? "#ff6969");
    }, [activeVisualModel]);

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

    const handleOpenDetail = (cls: SemanticModelClass) => {
        openEntityDetailDialog(cls);
    };

    const handleAddConcept = (model: InMemorySemanticModel) => {
        const resultSuccess = addClassToModel(model, { cs: getRandomName(5), en: getRandomName(5) }, undefined);
        if (!resultSuccess) {
            alert("FIXME: something went wrong, class not added to local model");
        }
    };

    const handleAddClassToActiveView = (classId: string) => {
        const updateStatus = activeVisualModel?.updateEntity(classId, { visible: true });
        if (!updateStatus) {
            aggregatorView?.getActiveVisualModel()?.addEntity({ sourceEntityId: classId });
        }
    };

    const handleRemoveClassFromActiveView = (classId: string) => {
        aggregatorView?.getActiveVisualModel()?.updateEntity(classId, { visible: false });
    };

    const handleOpenModification = (model: InMemorySemanticModel, cls: SemanticModelClass) => {
        openModifyEntityDialog(model, cls);
    };

    if (model instanceof ExternalSemanticModel) {
        clses = [...classes.entries()]
            .filter(([_, cwo]) => cwo.origin == modelId)
            .map(([clsId, cwo]) => (
                <ExpandableRow
                    cls={cwo}
                    key={clsId + aggregatorView.getActiveVisualModel()?.getId()}
                    toggleHandler={() => toggleAllow(model, clsId)}
                    expanded={() => allowedClasses.includes(clsId)}
                    openDetailHandler={() => handleOpenDetail(cwo.cls)}
                    addToViewHandler={() => handleAddClassToActiveView(clsId)}
                    removeFromViewHandler={() => handleRemoveClassFromActiveView(clsId)}
                    isVisibleOnCanvas={() =>
                        aggregatorView.getActiveVisualModel()?.getVisualEntity(clsId)?.visible ?? false
                    }
                />
            ));
    } else if (model instanceof InMemorySemanticModel) {
        clses = [...classes.entries()]
            .filter(([_, cwo]) => cwo.origin == model.getId())
            .map(([clsId, cwo]) => (
                <ModifiableRow
                    cls={cwo}
                    key={clsId + aggregatorView.getActiveVisualModel()?.getId()}
                    openDetailHandler={() => handleOpenDetail(cwo.cls)}
                    openModificationHandler={() => handleOpenModification(model, cwo.cls)}
                    addToViewHandler={() => handleAddClassToActiveView(clsId)}
                    removeFromViewHandler={() => handleRemoveClassFromActiveView(clsId)}
                    isVisibleOnCanvas={() =>
                        aggregatorView.getActiveVisualModel()?.getVisualEntity(clsId)?.visible ?? false
                    }
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
        clses = [...classes.values()]
            .filter((v) => v.origin == model.getId())
            .map((v) => (
                <NonExpandableRow
                    cls={v}
                    key={v.cls.id + aggregatorView.getActiveVisualModel()?.getId()}
                    openDetailHandler={() => openEntityDetailDialog(v.cls)}
                    addToViewHandler={() => handleAddClassToActiveView(v.cls.id)}
                    removeFromViewHandler={() => handleRemoveClassFromActiveView(v.cls.id)}
                    isVisibleOnCanvas={() =>
                        aggregatorView.getActiveVisualModel()?.getVisualEntity(v.cls.id)?.visible ?? false
                    }
                />
            ));
    }

    return (
        <>
            <li key={modelId} style={{ backgroundColor: tailwindColorToHex(backgroundColor) }}>
                <div className="flex flex-row justify-between">
                    <h4>Ⓜ {shortenSemanticModelId(modelId)}</h4>
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
        </>
    );
};
