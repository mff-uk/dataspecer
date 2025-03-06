import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";
import { VisualOperationExecutor } from "./visual-operation-executor";

export function addVisualNode(
  executor: VisualOperationExecutor,
  entity: {
    id: EntityDsIdentifier,
  },
  model: ModelDsIdentifier,
  position: { x: number, y: number },
  content: string[],
) {
  executor.visualModel.addVisualNode({
    model: model,
    representedEntity: entity.id,
    position: {
      x: position.x,
      y: position.y,
      anchored: null,
    },
    content,
    visualModels: [],
  });
}
