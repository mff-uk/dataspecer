import { INodeClassic } from "@dataspecer/layout";
import { useReactFlow } from "@xyflow/react";
import { useModelGraphContext } from "../context/model-context";
import { useMemo } from "react";


/**
 *
 * @returns Returns methods to get width and height of node. The returned methods implement the {@link NodeDimensionQueryHandler} interface used in layouting to get width/height of nodes.
 */
export const useReactflowDimensionQueryHandler = () => {
    const reactFlowInstance = useReactFlow();
    const { aggregatorView } = useModelGraphContext();
    const activeVisualModel = useMemo(() => aggregatorView.getActiveVisualModel(), [aggregatorView]);

    const getWidth = (node: INodeClassic) => {
        const visualNodeIdentifier = activeVisualModel?.getVisualEntityForRepresented(node.id)?.identifier ?? "";
        const width = reactFlowInstance.getNode(visualNodeIdentifier)?.measured?.width ?? 0;
        return width;
    };
	const getHeight = (node: INodeClassic) => {
        const visualNodeIdentifier = activeVisualModel?.getVisualEntityForRepresented(node.id)?.identifier ?? "";
        const height = reactFlowInstance.getNode(visualNodeIdentifier)?.measured?.height ?? 0;
        return height;
    };

    return {
        getWidth,
        getHeight
    };
};
