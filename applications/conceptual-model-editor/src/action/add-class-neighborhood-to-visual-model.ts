import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { addSemanticEntitiesToVisualModelAction, EntityToAddToVisualModel } from "./add-semantic-entities-to-visual-model";
import { extendSelectionAction, ExtensionType, NodeSelection, VisibilityFilter } from "./extend-selection-action";

export const addClassNeighborhoodToVisualModelAction = (
    notifications: UseNotificationServiceWriterType,
    classes: ClassesContextType,
    graph: ModelGraphContextType,
    diagram: UseDiagramType,
    visualModel: WritableVisualModel,
    identifier: string
): void => {
    const inputForExtension: NodeSelection = {
        identifiers: [identifier],
        areIdentifiersFromVisualModel: false
    };
    const neighborhoodPromise = extendSelectionAction(notifications, graph, classes, inputForExtension,
        [ExtensionType.ASSOCIATION, ExtensionType.GENERALIZATION], VisibilityFilter.ALL, false, null);
    neighborhoodPromise.then(neighborhood => {
        const classesOrClassProfilesToAdd: EntityToAddToVisualModel[] = [{identifier, position: null}];

        // We have to filter the source class, whose neighborhood we are adding, from the extension
        classesOrClassProfilesToAdd.push(...neighborhood.selectionExtension.nodeSelection.filter(node => node !== identifier).map(node => ({identifier: node, position: null})));
        addSemanticEntitiesToVisualModelAction(notifications, classes, graph, visualModel, diagram, classesOrClassProfilesToAdd);
    })
};
