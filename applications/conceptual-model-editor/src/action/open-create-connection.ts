import {
  isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { isVisualNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application/options";
import { ConnectionType, CreateConnectionState, createConnectionDialog } from "../dialog/obsolete/create-connection-dialog";
import { AssociationConnectionType, GeneralizationConnectionType } from "../util/edge-connection";
import { UseClassesContextType } from "../context/classes-context";
import { addSemanticGeneralizationToVisualModelAction } from "./add-generalization-to-visual-model";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";
import { addVisualRelationships } from "../dataspecer/visual-model/operation/add-visual-relationships";
import { addVisualRelationshipsWithGivenVisualEnds, collectVisualNodes } from "./utilities";

/**
 *
 * @param visualSourcesIdentifiers specifies the visual sources of the connection,
 * if set to null then the default ones taken from the {@link semanticSourceIdentifier} are used.
 * @param visualTargetsIdentifiers specifies the visual targets of the connection,
 * if set to null then the default ones taken from the {@link semanticTargetIdentifier} are used.
 * @returns
 */
export function openCreateConnectionDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  useClasses: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  semanticSourceIdentifier: string,
  semanticTargetIdentifier: string,
  visualSourcesIdentifiers: string[],
  visualTargetsIdentifiers: string[],
) {
  const entities = graph.aggregatorView.getEntities();

  const source = entities[semanticSourceIdentifier]?.aggregatedEntity ?? null;

  const target = entities[semanticTargetIdentifier]?.aggregatedEntity ?? null;

  if (source === null || target === null) {
    notifications.error("Can not find source or target in semantic model.");
    console.warn("Can not find source or target in semantic model.",
      {
        source,
        target,
        sourceIdentifier: semanticSourceIdentifier,
        targetIdentifier: semanticTargetIdentifier,
        entities
      });
    return;
  }

  if (!isSemanticModelClass(source) && !isSemanticModelClassUsage(source)) {
    notifications.error("Source entity is not of expected type.");
    console.warn("Dialog not opened as the  source entity is not of expected type.", { source });
    return;
  }

  if (!isSemanticModelClass(target) && !isSemanticModelClassUsage(target)) {
    notifications.error("Target entity is not of expected type.");
    console.warn("Dialog not opened as the target entity is not of expected type.", { source });
    return;
  }

  //
  const onConfirm = (state: CreateConnectionState) => {
    const result = state.type === ConnectionType.Association ?
      saveAssociationConnection(useClasses, state) :
      saveGeneralizationConnection(useClasses, state);
    //
    if (result === null || result.id === null || result.id === undefined) {
      return;
    }
    // Add visual representation.
    addVisualRelationshipsWithGivenVisualEnds(
      visualModel, state.model.getId(), result.id,
      visualSourcesIdentifiers, visualTargetsIdentifiers);
  };
  dialogs.openDialog(createConnectionDialog(
    graph, source, target, options.language, onConfirm));
}

const saveAssociationConnection = (useClasses: UseClassesContextType, state: CreateConnectionState) => {
  return useClasses.createConnection(state.model, {
    type: "association",
    ends: [
      {
        concept: state.source.id,
        cardinality: state.sourceCardinality,
      },
      {
        name: state.name ?? null,
        description: state.description ?? null,
        concept: state.target.id,
        cardinality: state.targetCardinality,
        iri: state.iri,
      },
    ],
  } as AssociationConnectionType);
};

const saveGeneralizationConnection = (useClasses: UseClassesContextType, state: CreateConnectionState) => {
  return useClasses.createConnection(state.model, {
    type: "generalization",
    child: state.source.id,
    parent: state.target.id,
    // https://github.com/mff-uk/dataspecer/issues/537
    iri: null,
  } as GeneralizationConnectionType);
};
