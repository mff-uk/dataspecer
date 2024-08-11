import { useCallback, useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useBaseDialog } from "../components/base-dialog";
import { useConfigurationContext } from "../context/configuration-context";
import { CreateButton } from "../components/dialog/buttons/create-button";
import { CancelButton } from "../components/dialog/buttons/cancel-button";
import { t } from "../application/";
import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { type EntityDetailSupportedType, EntityProxy } from "../util/detail-utils";
import { tailwindColorToHex } from "~/app/utils/color-utils";

const getDefaultColor = () => {
    return "#069420";
};

export const useSelectClassesDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [onSelectConfirmCallback, setOnSelectConfirmCallback] = useState<((newEntityID: string[]) => void) | undefined>(undefined);

    const localOpen = (onSelectConfirmCallback?: (newEntityID: string[]) => void) => {
        setOnSelectConfirmCallback(onSelectConfirmCallback);
        open();
    };

    // TODO: Maybe could be optimized later, when I get to know React better
    function createChangedRecord<T>(record: Record<string, T>, id: string, newValue: T): Record<string, T> {
        const newRecord = {...record};
        newRecord[id] = newValue;
        return newRecord;
    }


    const SelectClassesDialog = () => {   
        const [connectionsMap, setConnectionsMap] = useState<Record<string, boolean>>({});

        const { models, aggregatorView } = useModelGraphContext();
        const activeVisualModel = aggregatorView.getActiveVisualModel();     

        const { language: preferredLanguage } = useConfigurationContext();

        const getPreferredName = useCallback((entity: EntityDetailSupportedType) => {
            const { name } = EntityProxy(entity, preferredLanguage);
            return name;
        }, [preferredLanguage]);
            
        
        // TODO: Probably could use better dependecies, but if it works it works
        const getSelectedClasses = useCallback(() => {
            const selectedClasses = Object.entries(connectionsMap).map(([k, v]) => {                
                if(v) {
                    return k;
                }
            });
            if(selectedClasses === undefined) {
                return [];
            }
            else {
                return selectedClasses.filter(e => e !== undefined);
            }
        }, [connectionsMap]);

        const onAcceptCallback = useCallback(() => {
            if(onSelectConfirmCallback === undefined) {                
                close();                
            }
            else {
                onSelectConfirmCallback(getSelectedClasses());
                close();
            }            
        }, [getSelectedClasses]);
           

        // TODO: Probably will have to show profiles later differently (like in catalog - using TreeLikeOffset)
        return (
            <BaseDialog heading={t("select-classes-dialog.select-classes")}>
                <div>
                    {/* We could also modify and then reuse <EntityCatalog />, it would be kind of nice, but it would take a lot of time */}
                    <ul>
                        {[...models.entries()].map(([modelId, model]) => 
                            <div key={`select-classes-dialog-div-${model.getId()}`}>
                                <h4 key={`select-classes-dialog-h4-${model.getId()}`}>Ⓜ {model.getAlias() ?? ""}</h4>
                                {Object.values(model.getEntities()).map(e => {
                                    if(isSemanticModelClass(e) || isSemanticModelClassUsage(e)) {
                                        return <div key={`select-classes-dialog-div-${e.id}`} 
                                                    style={{ backgroundColor: tailwindColorToHex(activeVisualModel?.getColor(modelId) ?? getDefaultColor()) }}>
                                                    <li key={`select-classes-dialog-li-${e.id}`}><input type="checkbox" 
                                                        onChange={(event) => setConnectionsMap(createChangedRecord(connectionsMap, e.id, event.target.checked))}
                                                        // Note that if it is undefined we also set the value to false.
                                                        // We do this because otherwise the order of the created associations is same as the chosen order and not the model order
                                                        checked={connectionsMap[e.id] === undefined ? (connectionsMap[e.id] = false) : connectionsMap[e.id]}></input> {getPreferredName(e)}</li>
                                            </div>;
                                    }
                                })
                                }                        
                            </div>
                        )}
                    </ul>
                </div>    

                {/* TODO: Maybe try to improve dialog in case when it contains scrollbar 
                          For now just solved like this - https://stackoverflow.com/questions/67300514/how-to-make-button-static-and-fixed-at-bottom */}
                <div className="flex flex-row justify-evenly font-semibold sticky bottom-0 w-full">
                    <CreateButton onClick={onAcceptCallback} />
                    <CancelButton onClick={close} />
                </div>
            </BaseDialog>
        );
    };

    return {
        isSelectClassDialogOpen: isOpen,
        closeSelectClassDialog: close,
        openSelectClassDialog: localOpen,
        SelectClassesDialog,
    };
};
