import {
  isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
  isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../configuration/options";
import { ConnectionType, CreateConnectionState, createConnectionDialog } from "../dialog/obsolete/create-connection-dialog";
import { AssociationConnectionType, GeneralizationConnectionType } from "../util/edge-connection";
import { UseClassesContextType } from "../context/classes-context";
import { addSemanticGeneralizationToVisualModelAction } from "./add-generalization-to-visual-model";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";

export function openCreateConnectionDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  useClasses: UseClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  sourceIdentifier: string,
  targetIdentifier: string,
) {
  const entities = graph.aggregatorView.getEntities();

  const source = entities[sourceIdentifier]?.aggregatedEntity ?? null;

  const target = entities[targetIdentifier]?.aggregatedEntity ?? null;

  if (source === null || target === null) {
    notifications.error("Can not find source or target in semantic model.");
    console.warn("Can not find source or target in semantic model.", { source, target, sourceIdentifier, targetIdentifier, entities });
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
    if (state.type === ConnectionType.Association) {
      addSemanticRelationshipToVisualModelAction(
        notifications, graph, visualModel, result.id, state.model.getId());
    } else {
      addSemanticGeneralizationToVisualModelAction(
        notifications, graph, visualModel, result.id, state.model.getId());
    }
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
