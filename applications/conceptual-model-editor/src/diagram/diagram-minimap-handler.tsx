import { MiniMapNodeProps, Node, ReactFlowInstance, useReactFlow } from "@xyflow/react";
import { Node as ApiNode } from "./diagram-model";
import { JSX, useCallback } from "react";
import { EdgeType, NodeType } from "./diagram-controller";
import { VisualModelNodeName } from "./node/visual-model-diagram-node";

interface UseDiagramMinimapHandlerType {

  miniMapNodeColor(node: Node<ApiNode>): string;

  MiniMapNode(props: MiniMapNodeProps): JSX.Element;

}

export function useDiagramMinimapHandler(): UseDiagramMinimapHandlerType {
  const reactFlowInstance = useReactFlow<NodeType, EdgeType>();
  const MiniMapNode = useCallback(createRenderMiniMapNodeHandler(reactFlowInstance), [reactFlowInstance]);

  return {
    miniMapNodeColor,
    MiniMapNode,
  }
}

function miniMapNodeColor(node: Node<ApiNode>) {
  return node.data.color;
}

const createRenderMiniMapNodeHandler = (reactflowInstance: ReactFlowInstance<any, any>) => {
  return (props: MiniMapNodeProps): JSX.Element => {
    const node = reactflowInstance.getNode(props.id);
    if(node !== undefined) {


      if(node.type === VisualModelNodeName) {
        return <circle cx={props.x} cy={props.y} r="50" fill="#90D5FF"/>
        // TODO RadStr: Proper one - based don shape
        // return <ellipse x={props.x} y={props.y} width={props.width} height={props.height} fill="black"/>;
      }
    }
    // Otherwise just render rectangle
    return <rect x={props.x} y={props.y} width={props.width} height={props.height} fill={props.color}/>;
  }
}