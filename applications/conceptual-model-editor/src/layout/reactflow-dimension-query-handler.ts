import { INodeClassic } from "@dataspecer/layout";
import { useReactFlow } from "reactflow";


/**
 *
 * @returns Returns methods to get width and height of node. The returned methods implement the {@link NodeDimensionQueryHandler} interface used in layouting to get width/height of nodes.
 */
export const useReactflowDimensionQueryHandler = () => {
    const reactFlowInstance = useReactFlow();

    const getWidth = (node: INodeClassic) => {
        const width = reactFlowInstance.getNode(node.id)?.width ?? 0;
        return width;
    };
	const getHeight = (node: INodeClassic) => {
        const height = reactFlowInstance.getNode(node.id)?.height ?? 0;
        return height;
    };

    return {
        getWidth,
        getHeight
    };
};
