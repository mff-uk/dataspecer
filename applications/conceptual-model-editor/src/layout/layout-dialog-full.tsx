import { useMemo, useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useConfigDialog } from "./layout-dialog";
import { performLayoutOfVisualModel } from "@dataspecer/layout";
import { useReactflowDimensionQueryHandler } from "./reactflow-dimension-query-handler";
import { useActions } from "../action/actions-react-binding";
import { isVisualNode, isWritableVisualModel } from "@dataspecer/core-v2/visual-model";

export const useLayoutDialog = () => {
    const { getValidConfig, ConfigDialog } = useConfigDialog();

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
        setIsLayoutDialogOpen(true);
    };
    const close = () => {
        setIsLayoutDialogOpen(false);
    };

    const DialogComponent = () => {
        // The max-h-full makes it finally react to situation when dialog doesn't fit
        return  <dialog className="px-3 py-3 mt-[1vh] overflow-y-auto max-h-full" style={{zIndex: 10000}} open={isLayoutDialogOpen}>

                    <ConfigDialog></ConfigDialog>
                    <div className='h-2'></div>
                    <button onClick={onClickLayout} className="bg-transparent hover:bg-green-700 text-green-900 font-semibold hover:text-white py-2 px-4 border border-green-900 hover:border-transparent rounded">Layout</button>
                    <button onClick={close} className="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded">Close</button>
                </dialog>;
    };

    return {
        open,
        close,
        isLayoutDialogOpen,
        DialogComponent
    };
};
