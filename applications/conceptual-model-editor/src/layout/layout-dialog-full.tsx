import { useMemo, useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useConfigDialog } from "./layout-dialog";
import { performLayoutOfVisualModel } from "@dataspecer/layout";
import { useReactflowDimensionQueryHandler } from "./reactflow-dimension-query-handler";
import { useActions } from "../action/actions-react-binding";
import { isVisualNode, isWritableVisualModel } from "@dataspecer/core-v2/visual-model";

export const useLayoutDialog = () => {
    const { getValidConfig, ConfigDialog, resetConfig } = useConfigDialog();

    const { aggregatorView, models } = useModelGraphContext();

    const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);

    const reactflowDimensionQueryHandler = useReactflowDimensionQueryHandler();

    const actions = useActions();

    const onClickLayout = () => {
        if(activeVisualModel === null) {
            return;
        }

        performLayoutOfVisualModel(activeVisualModel,
                                    models,
                                    getValidConfig(),
                                    reactflowDimensionQueryHandler).then(result => {
                                        console.info("Layout result in editor");
                                        console.info(result);
                                        console.info(activeVisualModel.getVisualEntities());
                                        if(!isWritableVisualModel(activeVisualModel)) {
                                            return;
                                        }

                                        Object.entries(result).forEach(([key, value]) => {
                                            if(activeVisualModel.getVisualEntity(key) === undefined) {
                                                if(isVisualNode(value)) {
                                                    console.info("NEW NODE");
                                                    actions.addNodeToVisualModelToPosition(value.model, value.representedEntity, value.position)
                                                }
                                                else {
                                                    throw new Error("Not prepared for anything other than nodes when layouting")
                                                }
                                            }
                                            else {
                                                console.info("UPDATING");
                                                console.info(value.identifier);
                                                console.info(value);
                                                activeVisualModel?.updateVisualEntity(value.identifier, value);
                                            }
                                        });
                                    }).catch(console.warn).finally(() => close());
    };

    const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState<boolean>(false);
    const open = () => {
        // resetConfig();
        setIsLayoutDialogOpen(true);
    };
    const close = () => {
        setIsLayoutDialogOpen(false);
    };

    const DialogComponent = () => {
        return <div>
                    <ConfigDialog></ConfigDialog>
                    <button onClick={onClickLayout} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full">Accept</button>
                    <button onClick={close} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full">Cancel</button>
                </div>;
    };

    return {
        open,
        close,
        isLayoutDialogOpen,
        DialogComponent
    };
};
