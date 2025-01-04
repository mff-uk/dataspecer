import { VisualGroup, VisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";

export function addGroupToVisualModelAction(
    visualModel: WritableVisualModel,
    groupContent: string[],
  ): string {
  return visualModel.addVisualGroup({
      content: groupContent,
      anchored: null,
  });
}