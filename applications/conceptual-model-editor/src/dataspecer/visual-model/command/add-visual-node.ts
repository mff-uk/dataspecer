import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityDsIdentifier } from "../../entity-model";

export function addVisualNode(
  visualModel: WritableVisualModel,
  entity: {
    id: EntityDsIdentifier,
  },
  model: string,
  position: { x: number, y: number },
) {
  visualModel.addVisualNode({
    model: model,
    representedEntity: entity.id,
    position: {
      x: position.x,
      y: position.y,
      anchored: null,
    },
    content: [],
    visualModels: [],
  });
}
