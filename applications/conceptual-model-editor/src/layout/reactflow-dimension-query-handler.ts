import { INodeClassic, ReactflowDimensionsConstantEstimator } from "@dataspecer/layout";
import { useReactFlow } from "@xyflow/react";
import { useModelGraphContext } from "../context/model-context";
import { useMemo } from "react";

/**
 * @deprecated Use {@link createExactNodeDimensionsQueryHandler} instead
 * @returns Returns methods to get width and height of node.
 * The returned methods implement the {@link NodeDimensionQueryHandler} interface used in layouting to get width/height of nodes.
 */
export const useReactflowDimensionQueryHandler = () => {
  const reactFlowInstance = useReactFlow();

  const getWidth = (nodeIdentifer: string) => {
    // The question is what does it mean if the node isn't in editor? I think that it means that there is mistake in program. Same for height
    const width = reactFlowInstance.getNode(nodeIdentifer)?.measured?.width ?? ReactflowDimensionsConstantEstimator.getMinimumWidth();
    return width;
  };
  const getHeight = (nodeIdentifer: string) => {
    const height = reactFlowInstance.getNode(nodeIdentifer)?.measured?.height ?? ReactflowDimensionsConstantEstimator.getDefaultHeight();
    return height;
  };

  return {
    getWidth,
    getHeight
  };
};
