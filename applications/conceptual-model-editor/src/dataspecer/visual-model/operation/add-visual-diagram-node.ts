import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { LanguageString } from "@dataspecer/core/core/core-resource";

export function addVisualDiagramNode(
  visualModel: WritableVisualModel,
  label: LanguageString,
  description: LanguageString,
  position: { x: number, y: number },
  representedVisualModel: string,
): string {
  return visualModel.addVisualDiagramNode({
    label,
    description,
    position: {
      x: position.x,
      y: position.y,
      anchored: null,
    },
    representedVisualModel
  });
}
