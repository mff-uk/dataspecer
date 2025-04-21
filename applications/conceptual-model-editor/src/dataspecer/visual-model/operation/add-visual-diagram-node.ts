import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

export function addVisualDiagramNode(
  visualModel: WritableVisualModel,
  position: { x: number, y: number },
  representedVisualModel: string,
): string {
  return visualModel.addVisualDiagramNode({
    position: {
      x: position.x,
      y: position.y,
      anchored: null,
    },
    representedVisualModel
  });
}
