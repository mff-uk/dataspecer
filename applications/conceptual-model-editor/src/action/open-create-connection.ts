import {
  isSemanticModelClass,
  SemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../configuration/options";
import { ConnectionType, CreateConnectionState, createConnectionDialog } from "../dialog/obsolete/create-connection-dialog";
import { InvalidState, UnsupportedOperationException } from "../application/error";
import { createLogger } from "../application";
import { isSemanticModelClassProfile, SemanticModelClassProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { createCmeGeneralization, createCmeRelationship, updateCmeClassProfile } from "../dataspecer/cme-model/operation";
import { createEagerCmeOperationExecutor } from "../dataspecer/cme-model/operation/cme-operation-executor";
import { createVisualModelOperationExecutor, VisualModelOperationExecutor } from "../dataspecer/visual-model/visual-model-operation-executor";
import { findSourceModelOfEntity } from "../service/model-service";
import { withErrorBoundary } from "./utilities/error-utilities";

const LOG = createLogger(import.meta.url);

export function openCreateConnectionDialogAction(
  options: Options,
  dialogs: DialogApiContextType,
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  //
  sourceIdentifier: string,
  targetIdentifier: string,
) {
  withErrorBoundary(notifications,
    () => openCreateConnectionDialogActionInternal(
      options, dialogs, graph, visualModel, sourceIdentifier, targetIdentifier
    ));
}

/**
 * Handle situation when user drag a connection from one node to another.
 */
function openCreateConnectionDialogActionInternal(
  options: Options,
  dialogs: DialogApiContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  //
  sourceIdentifier: string,
  targetIdentifier: string,
) {
  const { source, target } =
    findSourceAndTarget(graph, sourceIdentifier, targetIdentifier);
  //
  const visualExecutor = createVisualModelOperationExecutor(visualModel);
  // We decide based on source and target type.
  if (isSemanticModelClass(source)
    && isSemanticModelClass(target)) {
    // Can be a relationship or generalization.
    openRelationshipOrGeneralizationDialog(
      options, dialogs, visualExecutor, graph, source, target);
  }
  else if (isSemanticModelClassProfile(source)
    && isSemanticModelClass(target)) {
    // Create a profile from class to the profile.
    createProfile(graph, visualExecutor, source, target);
  }
  else if (isSemanticModelClassProfile(source)
    && isSemanticModelClassProfile(target)) {
    // Create a relationship profile or generalization for profiles.
    // We do not support this yet.
  }
  else {
    // We do not know.
    throw new UnsupportedOperationException();
  }
}

/**
 * @throws {InvalidState}
 */
function findSourceAndTarget(
  graph: ModelGraphContextType,
  sourceIdentifier: string,
  targetIdentifier: string,
) {
  const entities = graph.aggregatorView.getEntities();
  const source = entities[sourceIdentifier]?.aggregatedEntity ?? null;
  const target = entities[targetIdentifier]?.aggregatedEntity ?? null;
  if (source === null || target === null) {
    LOG.error("Can not find a source or a target in the semantic model.",
      { source, target, sourceIdentifier, targetIdentifier, entities });
    throw new InvalidState();
  }
  return { source, target };
}

function openRelationshipOrGeneralizationDialog(
  options: Options,
  dialogs: DialogApiContextType,
  visualExecutor: VisualModelOperationExecutor,
  graph: ModelGraphContextType,
  source: SemanticModelClass,
  target: SemanticModelClass,
) {
  const onConfirm = (state: CreateConnectionState) => {
    switch (state.type) {
    case ConnectionType.Association:
      createRelationship(graph, visualExecutor, state);
      break;
    case ConnectionType.Generalization:
      createGeneralization(graph, visualExecutor, state);
      break;
    }
  };

  dialogs.openDialog(createConnectionDialog(
    graph, source, target, options.language, onConfirm));

}

function createRelationship(
  graph: ModelGraphContextType,
  visualExecutor: VisualModelOperationExecutor,
  state: CreateConnectionState,
) {
  const relationship = createCmeRelationship(
    createEagerCmeOperationExecutor(graph.models), {
      model: state.model.getId(),
      iri: state.iri,
      name: state.name,
      description: state.description ?? null,
      domain: state.source.id,
      domainCardinality: state.sourceCardinality,
      range: state.source.id,
      rangeCardinality: state.targetCardinality,
    });

  visualExecutor.addRelationship(
    relationship, state.source.id, state.target.id);
}

function createGeneralization(
  graph: ModelGraphContextType,
  visualExecutor: VisualModelOperationExecutor,
  state: CreateConnectionState,
) {
  const generalization = createCmeGeneralization(
    createEagerCmeOperationExecutor(graph.models), {
      model: state.model.getId(),
      // https://github.com/mff-uk/dataspecer/issues/537
      iri: null,
      childIdentifier: state.source.id,
      parentIdentifier: state.target.id,
    });

  visualExecutor.addRelationship(
    generalization, state.source.id, state.target.id);
}

function createProfile(
  graph: ModelGraphContextType,
  visualExecutor: VisualModelOperationExecutor,
  source: SemanticModelClassProfile,
  target: SemanticModelClass,
) {
  const sourceModel = findSourceModelOfEntity(source.id, graph.models);
  const targetModel = findSourceModelOfEntity(source.id, graph.models);

  if (sourceModel === null || targetModel === null) {
    LOG.error("Missing model for entity.",
      { source, target, sourceModel, targetModel });
    throw new InvalidState();
  }

  const prevProfiles = source.profiling;
  if (!prevProfiles.includes(target.id)) {
    // We update the class profile.
    updateCmeClassProfile(
      createEagerCmeOperationExecutor(graph.models), {
        identifier: source.id,
        model: sourceModel.getId(),
        profileOf: [...prevProfiles, target.id],
      });
    return;
  }

  // Now we add to the visual.
  visualExecutor.addProfile({
    identifier: source.id,
    model: sourceModel.getId(),
  }, {
    identifier: target.id,
    model: targetModel.getId()
  });

}
