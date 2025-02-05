import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { findSourceModelOfEntity } from "../service/model-service";
import { filterInMemoryModels } from "../util/model-utils";
import { placePositionOnGrid } from "@dataspecer/layout";
import { Options, configuration } from "../application";
import { CreatedSemanticEntityData, openCreateClassDialogAction } from "./open-create-class-dialog";
import { isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../context/classes-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Position } from "../diagram";
import { UseDiagramType } from "../diagram/diagram-hook";
import { EditClassDialogState } from "../dialog/class/edit-class-dialog-controller";

export function openCreateClassDialogWithModelDerivedFromClassAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  options: Options,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
  positionToPlaceClassOn: Position,
  onConfirmCallback: ((createdClass: CreatedSemanticEntityData, state: EditClassDialogState) => void) | null,
) {
  const node = visualModel.getVisualEntity(nodeIdentifier);
  if(node === null) {
    notifications.error("Given node to create class from could not be found");
    return;
  }

  if(!isVisualNode(node)) {
    notifications.error("Given node to create class from could is not a node");
    return;
  }

  let model = findSourceModelOfEntity(node.representedEntity, graph.models);
  if (model === null || !(model instanceof InMemorySemanticModel)) {
    // Take the first model in memory model
    model = filterInMemoryModels([...graph.models.values()])?.[0] ?? null;
  }

  // The model is either null or InMemotySemanticModel
  if (!(model instanceof InMemorySemanticModel)) {
    notifications.error("Can't find InMemorySemanticModel to put the association in");
    return;
  }

  placePositionOnGrid(positionToPlaceClassOn, configuration().xSnapGrid, configuration().ySnapGrid);
  openCreateClassDialogAction(options, dialogs, classes, graph, notifications, visualModel,
    diagram, model, positionToPlaceClassOn, onConfirmCallback);
}
