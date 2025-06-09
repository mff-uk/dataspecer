import { getNodesBounds, getViewportForBounds } from "@xyflow/react";

import { toSvg } from "html-to-image";
import { NodeType } from "./diagram-controller";

export async function diagramContentAsSvg(nodes: NodeType[]): Promise<string | null> {
  return await getSvg(nodes);
}

async function getSvg(nodes: NodeType[], width = 800, heigh = 550) : Promise<string | null> {
  // We calculate a transform for the nodes so that all nodes are visible.
  // We then overwrite the transform of the `.react-flow__viewport`
  // element with the style option of the html-to-image library.
  const nodesBounds = getNodesBounds(nodes);
  const transform = getViewportForBounds(nodesBounds, width, heigh, 0.01, 2, 0.065);

  const flow__viewport = document.querySelector(".react-flow__viewport") as HTMLElement | null;

  if (!flow__viewport) {
    return null;
  }

  return toSvg(flow__viewport, {
    backgroundColor: "#ffffff",
    width: width,
    height: heigh,
    style: {
      width: width.toString(),
      height: heigh.toString(),
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
    },
  });
};
