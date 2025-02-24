import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";

import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { ModelGraphContextType } from "../context/model-context";
import { withAggregatedEntity } from "./utilities";
import { withErrorBoundary } from "./utilities/error-utilities";
import { addSemanticGeneralizationToVisualModel } from "../dataspecer/visual-model/operation/add-semantic-generalization";

export function addSemanticGeneralizationToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  entityIdentifier: string,
  modelIdentifier: string,
  givenVisualSources: string[] | null,
  givenVisualTargets: string[] | null
) {
  const entities = graph.aggregatorView.getEntities();
  withErrorBoundary(notifications, () =>
    withAggregatedEntity(notifications, entities, entityIdentifier, modelIdentifier,
      isSemanticModelGeneralization, (entity) => {
        addSemanticGeneralizationToVisualModel(visualModel, modelIdentifier, entity, givenVisualSources, givenVisualTargets);
      })
  );
}
