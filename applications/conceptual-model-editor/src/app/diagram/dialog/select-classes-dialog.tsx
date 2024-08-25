import { useCallback, useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { isSemanticModelClass, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useBaseDialog } from "../components/base-dialog";
import { useConfigurationContext } from "../context/configuration-context";
import { CreateButton } from "../components/dialog/buttons/create-button";
import { CancelButton } from "../components/dialog/buttons/cancel-button";
import { t } from "../application/";
import { isSemanticModelClassUsage, SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { type EntityDetailSupportedType, EntityProxy } from "../util/detail-utils";
import { tailwindColorToHex } from "~/app/utils/color-utils";
import { Entity, EntityModel } from "@dataspecer/core-v2";
import { ModalDialog } from "./modal-dialog";

const getDefaultColor = () => {
    return "#069420";
};

export interface SelectClassesDialogProps {
    isOpen: boolean;
    close: () => void;
    onSelectConfirmCallback?: (newEntityID: string[]) => void;
}

export interface SelectClassesDialogContext {
    open: (onSelectConfirmCallback?: (newEntityID: string[]) => void) => void;
    props: SelectClassesDialogProps;
}


export const useSelectClassesDialog = (): SelectClassesDialogContext => {
    const [isOpen, setIsOpen] = useState(false);

    const close = () => {
        setIsOpen(false);
    };

    const internalOpen = () => {
        setIsOpen(true);
    };


    const [onSelectConfirmCallback, setOnSelectConfirmCallback] = useState<((newEntityID: string[]) => void) | undefined>(undefined);

    const open = (onSelectConfirmCallback?: (newEntityID: string[]) => void) => {
        setOnSelectConfirmCallback(onSelectConfirmCallback);
        internalOpen();
    };

    return {
        open,
        props: {
            isOpen,
            close,
            onSelectConfirmCallback
        },
    };
};


export const SelectClassesDialog = (selectClassesDialogProps: SelectClassesDialogProps) => {
    const { isOpen, close, onSelectConfirmCallback } = selectClassesDialogProps;

    const selectionMap: Record<string, boolean> = {};

    const { models, aggregatorView } = useModelGraphContext();
    const activeVisualModel = aggregatorView.getActiveVisualModel();

    const { language: preferredLanguage } = useConfigurationContext();

    const getPreferredName = useCallback((entity: EntityDetailSupportedType) => {
        const { name } = EntityProxy(entity, preferredLanguage);
        return name;
    }, [preferredLanguage]);


    if(!isOpen) {
        return null;
    }



    const getSelectedClasses = (selectionMap: Record<string, boolean>) => {
        const selectedClasses = Object.entries(selectionMap).map(([classID, isSelected]) => {
            if(isSelected) {
                return classID;
            }
        });
        return selectedClasses.filter(selectedClass => selectedClass !== undefined);
    };

    const onAcceptCallback = () => {
        if(onSelectConfirmCallback === undefined) {
            close();
        }
        else {
            onSelectConfirmCallback(getSelectedClasses(selectionMap));
            close();
        }
    };

    const getClassesAndClassUsages = (model: EntityModel) => {
        return Object.values(model.getEntities()).filter((entity) => isSemanticModelClass(entity) || isSemanticModelClassUsage(entity));
    };

    const renderSelectionRow = (entity: SemanticModelClass | SemanticModelClassUsage, modelId: string) => {
        // We set to default value (false), so that we can preserve the model order for the callback
        selectionMap[entity.id] = false;

        return <div key={`select-classes-dialog-div-${entity.id}`}
                    style={{ backgroundColor: tailwindColorToHex(activeVisualModel?.getColor(modelId) ?? getDefaultColor()) }}>
                    <li key={`select-classes-dialog-li-${entity.id}`}><input type="checkbox"
                        onChange={(event) => selectionMap[entity.id] = event.target.checked}>
                        </input> {getPreferredName(entity)}
                    </li>
                </div>;
    };

    const renderModel = (model: EntityModel, modelId: string) => {
        return <div key={`select-classes-dialog-div-${model.getId()}`}>
                    <h4 key={`select-classes-dialog-h4-${model.getId()}`}>Ⓜ {model.getAlias() ?? ""}</h4>
                    {
                        getClassesAndClassUsages(model).map(entity => {
                            return renderSelectionRow(entity, modelId);
                        })
                    }
        </div>;
    };


    const footer = (
        <div className="flex flex-row justify-evenly font-semibold sticky bottom-0 w-full">
                <CreateButton onClick={onAcceptCallback} />
                <CancelButton onClick={close} />
        </div>
    );

    const dialogContent = (
        <div>
            <ul>
                {[...models.entries()].map(([modelId, model]) =>
                    renderModel(model, modelId)
                )}
            </ul>
        </div>
    );


    return (
        <ModalDialog
            heading={t("select-classes-dialog.select-classes")}
            isOpen={isOpen}
            onCancel={close}
            content={dialogContent}
            footer={footer}
        />
    );
};
