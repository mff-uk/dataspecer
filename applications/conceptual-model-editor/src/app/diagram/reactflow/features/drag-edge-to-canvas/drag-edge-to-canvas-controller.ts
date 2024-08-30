import { useEffect, useRef, useState } from "react";
import { useCanvasMenuOptions } from "../../components/drag-edge-canvas-menu";
import { Connection, ReactFlowInstance } from "reactflow";
import { useDialogsContext } from "../../../context/dialogs-context";


// TODO: For now just pass in the create connection dialog stuff as parameters, since right now there isn't one point from which this concrete dialog is opened
// TODO: and there will be some stack-like dialog so the isCreateConnectionDialogOpen might not also be used, but here we should be carefully to not open 100 dialogs at once
export const useDragEdgeToCanvas = (isCreateConnectionDialogOpen: boolean, openCreateConnectionDialog: (connection: Connection) => void) => {
    const { isCanvasMenuOptionsOpen, CanvasMenuOptions,
            canvasMenuXYPosition, openCanvasMenuOptions, setCanvasMenuXYPosition } = useCanvasMenuOptions();

    const [nodeStartingConnection, setNodeStartingConnection] = useState<{ nodeId: string | null; handleId: string | null; handleType: "source" | "target" | null; }>();
    const [entityIDsToConnectTo, setEntityIDsToConnectTo] = useState<string[]>([]);

    const { openCreateClassDialogWithCallback } = useDialogsContext();

    // Based on https://github.com/xyflow/xyflow/issues/1207
    const isConnectionCreated = useRef(false);
    const createdConnectionInReactflow = () => {
        isConnectionCreated.current = true;
    };



    const onSelectClassesCallback = () => (newEntityIDs: string[]) => {
        setEntityIDsToConnectTo([...entityIDsToConnectTo, ...newEntityIDs]);
    };

    const onCreateClassCallback = () => (newEntityID: string) => {
        // With timeout the dialog is in the same place, but it takes a moment to get there
        setTimeout(() => setEntityIDsToConnectTo([...entityIDsToConnectTo, newEntityID]), 100);
    };

    useEffect(() => {
        if(entityIDsToConnectTo !== undefined && entityIDsToConnectTo.length > 0 && !isCreateConnectionDialogOpen) {
            const connection = {
                source: nodeStartingConnection?.handleType === "source" ? nodeStartingConnection?.nodeId : (entityIDsToConnectTo.shift() as string),
                target: nodeStartingConnection?.handleType === "target" ? nodeStartingConnection?.nodeId : (entityIDsToConnectTo.shift() as string),
                sourceHandle: null,
                targetHandle: null
            };

            openCreateConnectionDialog(connection);
        }
    }, [entityIDsToConnectTo, isCreateConnectionDialogOpen]);

    const openCreateClassDialogOnCanvasHandler = (reactFlowInstance: ReactFlowInstance<any, any>) => {
        const position = reactFlowInstance?.screenToFlowPosition({
            x: canvasMenuXYPosition?.x ?? 500,
            y: canvasMenuXYPosition?.y ?? 250,
        });
        openCreateClassDialogWithCallback(onCreateClassCallback, undefined, position);
    };


    const onConnectStart = (params: { nodeId: string | null; handleId: string | null; handleType: "source" | "target" | null; }) => {
        setNodeStartingConnection(params);
        isConnectionCreated.current = false;
    };


    const onConnectEnd = (event: any) => {
        // Does reactflow v12 have better typing or why do we need to do this? Check next comments for more context.
        const eventAsMouseEvent = event as unknown as React.MouseEvent;
        // The idea of checking if we are click on canvas comes from here:
        // https://reactflow.dev/examples/nodes/add-node-on-edge-drop
        // Also notice that in the reactflow example, they are also accessing the clientX, clientY so there really might be some typing issue.
        const target = eventAsMouseEvent.target as unknown as {classList: DOMTokenList};
        const isTargetPane = target.classList.contains("react-flow__pane");
        setCanvasMenuXYPosition({
            x: eventAsMouseEvent.clientX,
            y: eventAsMouseEvent.clientY,
        });
        if (!isConnectionCreated.current && isTargetPane) {
            openCanvasMenuOptions();
        }
    };

    return {
        onConnectStart,
        onConnectEnd,
        createdConnectionInReactflow,

        onSelectClassesCallback,
        openCreateClassDialogOnCanvasHandler,

        // TODO: Again if it the CanvasMenuOptions component will be later opened from 1 place, there is no need to export this
        isCanvasMenuOptionsOpen,
        CanvasMenuOptions
    };
};