import { useMemo, useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useConfigDialog } from "./layout-dialog";
import { doEditorLayout } from "@dataspecer/layout";
import { useReactflowDimensionQueryHandler } from "./reactflow-dimension-query-handler";

export const useLayoutDialog = () => {
    const { getValidConfig, ConfigDialog, resetConfig } = useConfigDialog();

    const { aggregatorView, models } = useModelGraphContext();

    const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);

    const reactflowDimensionQueryHandler = useReactflowDimensionQueryHandler();

    const onClickLayout = () => {
        if(activeVisualModel === null) {
            return;
        }

        doEditorLayout(activeVisualModel,
                        models,
                        getValidConfig(),
                        reactflowDimensionQueryHandler).then(result => {
                            console.info("Layout result in editor");
                            console.info(result);
                            console.info(activeVisualModel.getVisualEntities());
                            Object.entries(result).forEach(([key, value]) => {
                                if(activeVisualModel.getVisualEntity(key) === undefined) {
                                    activeVisualModel.addEntity(value);
                                }
                                else {
                                    activeVisualModel?.updateEntity(key, { position: value.position, visible: true });
                                }
                            });
                        }).catch(console.warn).finally(() => close());
    };

    const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState<boolean>(false);
    const open = () => {
        resetConfig();
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