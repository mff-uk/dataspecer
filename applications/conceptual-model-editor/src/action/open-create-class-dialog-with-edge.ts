import { isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { EntityRepresentative, findRepresentative, findVocabularyForModel } from "../dialog/utilities/dialog-utilities";
import { openCreateClassDialogWithModelDerivedFromClassAction } from "./open-create-class-dialog-with-derived-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContextType } from "../context/model-context";
import { ClassesContextType } from "../context/classes-context";
import { Options } from "../application";
import { DialogApiContextType } from "../dialog/dialog-service";
import { UseDiagramType } from "../diagram/diagram-hook";
import { Position } from "../diagram";
import { addSemanticGeneralizationToVisualModelAction } from "./add-generalization-to-visual-model";
import { ClassDialogState } from "../dialog/class/edit-class-dialog-state";
import { createNewAssociationDialogState } from "../dialog/association/edit-association-dialog-state";
import { CmeModelOperationExecutor } from "../dataspecer/cme-model/cme-model-operation-executor";
import { associationDialogStateToNewCmeRelationship } from "../dialog/association/edit-association-dialog-state-adapter";
import { CmeReference } from "../dataspecer/cme-model/model";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";

// TODO RadStr: 2 Actions - split into 2 files later

export function openCreateClassDialogAndCreateAssociationAction(
  cmeExecutor: CmeModelOperationExecutor,
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
  const onConfirm = (created: CmeReference, state: ClassDialogState) => {
    createAssociationToCreatedClass(
      cmeExecutor, notifications, classes, options, graph, visualModel,
      nodeIdentifier, isCreatedClassTarget, created, state);
  }

  openCreateClassDialogWithModelDerivedFromClassAction(
    cmeExecutor, notifications, graph, dialogs, classes, options,
    diagram, visualModel, nodeIdentifier, positionToPlaceClassOn, onConfirm);
}

function createAssociationToCreatedClass(
  cmeExecutor: CmeModelOperationExecutor,
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  options: Options,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
  isCreatedClassTarget: boolean,
  createdClassData: CmeReference,
  editClassDialogState: ClassDialogState
) {
  const state = createNewAssociationDialogState(
    classes, graph, visualModel, options.language, null);

  const node = visualModel.getVisualEntity(nodeIdentifier);
  if (node === null) {
    notifications.error("Source node of the drag event is not in visual model");
    return;
  }
  if (!isVisualNode(node)) {
    notifications.error("Source node of the drag event is not a node");
    return;
  }
  const sourceClassIdentifier = node.representedEntity;

  const vocabularyForCreatedClass = findVocabularyForModel(
    graph, visualModel, createdClassData.model);
  const createdClassEntityRepresentative: EntityRepresentative = {
    identifier: createdClassData.identifier,
    iri: editClassDialogState.iri,
    model: vocabularyForCreatedClass?.identifier ?? "",
    name: editClassDialogState.name,
    label: editClassDialogState.name,
    description: editClassDialogState.description,
    profileOfIdentifiers: [],
    usageNote: null,
    isProfile: false
  };

  if (isCreatedClassTarget) {
    state.range = createdClassEntityRepresentative;

    const domain = findRepresentative(state.availableDomains, sourceClassIdentifier);
    if (domain === null) {
      notifications.error("Can not find the source class of the drag event in the representatives of domains");
      return;
    }
    state.domain = domain;
  }
  else {
    state.domain = createdClassEntityRepresentative;

    const range = findRepresentative(state.availableRanges, sourceClassIdentifier);
    if (range === null) {
      notifications.error("Can not find the source class of the drag event in the representatives of ranges");
      return;
    }
    state.range = range;
  }

  const result = cmeExecutor.createRelationship(
    associationDialogStateToNewCmeRelationship(state));
  cmeExecutor.updateSpecialization(result, state.model.identifier,
    [], state.specializations);

  addSemanticRelationshipToVisualModelAction(
    notifications, graph, visualModel, result.identifier, result.model);
}

export function openCreateClassDialogAndCreateGeneralizationAction(
  cmeExecutor: CmeModelOperationExecutor,
  notifications: UseNotificationServiceWriterType,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  options: Options,
  graph: ModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
  isCreatedClassParent: boolean,
  positionToPlaceClassOn: Position,
) {
  const onConfirm = (createdClassData: CmeReference) => {
    createGeneralizationToCreatedClass(
      cmeExecutor, notifications, graph,
      visualModel, nodeIdentifier, isCreatedClassParent, createdClassData);
  }

  // TODO RadStr: Action in action
  openCreateClassDialogWithModelDerivedFromClassAction(
    cmeExecutor, notifications, graph, dialogs, classes, options,
    diagram, visualModel, nodeIdentifier, positionToPlaceClassOn, onConfirm);
}

function createGeneralizationToCreatedClass(
  cmeExecutor: CmeModelOperationExecutor,
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
  isCreatedClassParent: boolean,
  createdClassData: CmeReference,
) {
  const node = visualModel.getVisualEntity(nodeIdentifier);
  if (node === null) {
    notifications.error("Source node of the drag event is not in visual model");
    return;
  }
  if (!isVisualNode(node)) {
    notifications.error("Source node of the drag event is not a node");
    return;
  }
  const sourceClassIdentifier = node.representedEntity;

  const result = cmeExecutor.createGeneralization({
    model: createdClassData.model,
    iri: null,
    childIdentifier: isCreatedClassParent ? sourceClassIdentifier : createdClassData.identifier,
    parentIdentifier: isCreatedClassParent ? createdClassData.identifier : sourceClassIdentifier,
  });

  addSemanticGeneralizationToVisualModelAction(
    notifications, graph, visualModel, result.identifier, result.model);
}
