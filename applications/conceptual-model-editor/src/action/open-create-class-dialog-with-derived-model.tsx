import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { findSourceModelOfEntity } from "../service/model-service";
import { filterInMemoryModels } from "../util/model-utils";
import { placePositionOnGrid } from "@dataspecer/layout";
import { configuration, Options } from "../application";
import { openCreateClassDialogAction } from "./open-create-class-dialog";
import { isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../context/classes-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Node, Position } from "../diagram";
import { UseDiagramType } from "../diagram/diagram-hook";

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

    if (model === null) {
        notifications.error("Can't find InMemorySemanticModel to put the association in");
        return;
    }

    placePositionOnGrid(positionToPlaceClassOn, configuration().xSnapGrid, configuration().ySnapGrid);

    // TODO:
    // I think that it was mentioned, that the variant with opening association dialog right after creating class should be implemented.
    // That needs 2 things:
    //            1) Get the result of createClassAction. There are 2 ways to do this.
    //                    a) Wait for dialog to finish here, but we also need to get the result and the "classes" variable is not updated, so we would have to get result somehow
    //                    b) Pass in callback
    // On a side note currently when new dialog is opened within the onAccept method, the dialog is not opened, since it is closed together with the dialog which is in onAccept.

    openCreateClassDialogAction(options, dialogs, classes, graph, notifications, visualModel, diagram, model as InMemorySemanticModel, positionToPlaceClassOn);
}