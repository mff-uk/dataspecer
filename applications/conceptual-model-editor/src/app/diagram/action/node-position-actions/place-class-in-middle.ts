import { ModelGraphContextType } from "../../context/model-context";
import { isWritableVisualModel } from "@dataspecer/core-v2/visual-model";

export const getMiddleOfViewportForNodePosition = (editorApi: EditorApiContextType) => {
    const viewDimensions = editorApi.getViewport();
    const middle =  {
        x: viewDimensions.position.x + viewDimensions.width / 2,
        y: viewDimensions.position.y + viewDimensions.height / 2,
    };

    const nodeDimensions = getDefaultNodeDimensions();
    middle.x -= nodeDimensions.width / 2;
    middle.y -= nodeDimensions.height / 2;

    return middle;
};

export const putNodeToMiddleOfViewport = (nodeId: string, graph: ModelGraphContextType, editorApi: EditorApiContextType) => {
    const activeVisualModel = graph.aggregatorView.getActiveVisualModel();
    if(activeVisualModel === null || !isWritableVisualModel(activeVisualModel)) {
        return;
    }

    const middle = getMiddleOfViewportForNodePosition(editorApi);
    const node = activeVisualModel.getVisualEntity(nodeId);
    if(node !== undefined) {
        const nodeInMiddle = {...node, position: middle};       // TODO: Have to work with VisualNode type
        activeVisualModel.updateVisualEntity(nodeId, nodeInMiddle)
    }
};

const getDefaultNodeDimensions = () => {
    return {
        width: 400,
        height: 64,
    };
};
