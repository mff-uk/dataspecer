import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

export function addGroupToVisualModelAction(
    visualModel: WritableVisualModel,
    groupContent: string[],
  ): string {
  //
  // TODO: Maybe also add all the nodes if they are not present?
  return visualModel.addVisualGroup({
      content: groupContent,
      anchored: null,
  });
}