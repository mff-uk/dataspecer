import { isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { CreatedSemanticEntityData } from "./open-create-class-dialog";
import { EditClassDialogState } from "../dialog/class/edit-class-dialog-controller";
import { EntityRepresentative, findRepresentative, findVocabularyForModel } from "../dialog/utilities/dialog-utilities";
import { openCreateClassDialogWithModelDerivedFromClassAction } from "./open-create-class-dialog-with-derived-model";
import { createCreateAssociationDialogState } from "../dialog/association/create-new-association-dialog-state";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContextType } from "../context/model-context";
import { ClassesContextType, UseClassesContextType } from "../context/classes-context";
import { Options } from "../application";
import { createSemanticAssociation } from "./open-create-association-dialog";
import { DialogApiContextType } from "../dialog/dialog-service";
import { UseDiagramType } from "../diagram/diagram-hook";
import { Position } from "../diagram";
import { GeneralizationConnectionType } from "../util/edge-connection";
import { addSemanticGeneralizationToVisualModelAction } from "./add-generalization-to-visual-model";

// TODO RadStr: 2 Actions - split into 2 files later

export function openCreateClassDialogAndCreateAssociationAction(
  notifications: UseNotificationServiceWriterType,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  options: Options,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
  isCreatedClassTarget: boolean,
  positionToPlaceClassOn: Position,
) {
  const onConfirm = (createdClassData: CreatedSemanticEntityData, state: EditClassDialogState) => {
    createAssociationToCreatedClass(notifications, classes, options, graph, visualModel,
      nodeIdentifier, isCreatedClassTarget, createdClassData, state);
  }

  // TODO RadStr: I still don't see how to handle actions in actions calls and if it is always bad
  openCreateClassDialogWithModelDerivedFromClassAction(notifications, graph, dialogs, classes, options,
    diagram, visualModel, nodeIdentifier, positionToPlaceClassOn, onConfirm);
}

export function openCreateClassDialogAndCreateGeneralizationAction(
  notifications: UseNotificationServiceWriterType,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  useClasses: UseClassesContextType,
  options: Options,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
  isCreatedClassParent: boolean,
  positionToPlaceClassOn: Position,
) {
  const onConfirm = (createdClassData: CreatedSemanticEntityData, _: EditClassDialogState) => {
    createGeneralizationToCreatedClass(notifications, useClasses, graph,
      visualModel, nodeIdentifier, isCreatedClassParent, createdClassData);
  }

  // TODO RadStr: Action in action
  openCreateClassDialogWithModelDerivedFromClassAction(notifications, graph, dialogs, classes, options,
    diagram, visualModel, nodeIdentifier, positionToPlaceClassOn, onConfirm);
}

function createGeneralizationToCreatedClass(
  notifications: UseNotificationServiceWriterType,
  useClasses: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
  isCreatedClassParent: boolean,
  createdClassData: CreatedSemanticEntityData,
) {
  const node = visualModel.getVisualEntity(nodeIdentifier);
  if(node === null) {
    notifications.error("Source node of the drag event is not in visual model");
    return;
  }
  if(!isVisualNode(node)) {
    notifications.error("Source node of the drag event is not a node");
    return;
  }
  const sourceClassIdentifier = node.representedEntity;

  const result = useClasses.createConnection(createdClassData.model, {
    type: "generalization",
    child: isCreatedClassParent ? sourceClassIdentifier : createdClassData.identifier,
    parent: isCreatedClassParent ? createdClassData.identifier : sourceClassIdentifier,
    iri: null,
  } as GeneralizationConnectionType);

  if(result === null || result.id === undefined) {
    notifications.error("The creation of generalization in semantic model failed");
    return;
  }

  addSemanticGeneralizationToVisualModelAction(notifications, graph, visualModel, result.id, createdClassData.model.getId());
}

function createAssociationToCreatedClass(
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  options: Options,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
  isCreatedClassTarget: boolean,
  createdClassData: CreatedSemanticEntityData,
  editClassDialogState: EditClassDialogState
) {
  const defaultEditAssociationState = createCreateAssociationDialogState(classes, graph, visualModel, options.language, null);

  const node = visualModel.getVisualEntity(nodeIdentifier);
  if(node === null) {
    notifications.error("Source node of the drag event is not in visual model");
    return;
  }
  if(!isVisualNode(node)) {
    notifications.error("Source node of the drag event is not a node");
    return;
  }
  const sourceClassIdentifier = node.representedEntity;

  const vocabularyForCreatedClass = findVocabularyForModel(graph, visualModel, createdClassData.model.getId());
  const createdClassEntityRepresentative: EntityRepresentative = {
    identifier: createdClassData.identifier,
    iri: editClassDialogState.iri,
    vocabularyDsIdentifier: vocabularyForCreatedClass?.dsIdentifier ?? "",
    label: editClassDialogState.name,
    description: editClassDialogState.description,
    profileOfIdentifiers: [],
    usageNote: null,
    isProfile: false
  };

  if(isCreatedClassTarget) {
    defaultEditAssociationState.range = createdClassEntityRepresentative;

    const domain = findRepresentative(defaultEditAssociationState.availableDomains, sourceClassIdentifier);;
    if(domain === null) {
      notifications.error("Can not find the source class of the drag event in the representatives of domains");
      return;
    }
    defaultEditAssociationState.domain = domain;
  }
  else {
    defaultEditAssociationState.domain = createdClassEntityRepresentative;

    const range = findRepresentative(defaultEditAssociationState.availableRanges, sourceClassIdentifier);;
    if(range === null) {
      notifications.error("Can not find the source class of the drag event in the representatives of ranges");
      return;
    }
    defaultEditAssociationState.range = range;
  }

  createSemanticAssociation(notifications, visualModel, graph, defaultEditAssociationState, true);
}
