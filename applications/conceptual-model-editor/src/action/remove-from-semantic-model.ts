import type { ModelGraphContextType } from "../context/model-context";
import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { deleteEntity } from "@dataspecer/core-v2/semantic-model/operations";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";

/**
 * Removes entities from the given semantic models.
 */
export async function removeFromSemanticModelsAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  modelIdentifiers: string[],
  identifiers: string[],
) {
  for(let i = 0; i < identifiers.length; i++) {
    const identifier = identifiers[i];
    if(i >= modelIdentifiers.length) {
      notifications.error(`Given semantic entity doesn't have source model in given arguments`);
      continue;
    }
    const modelIdentifier = modelIdentifiers[i];
    const model = graph.models.get(modelIdentifier);
    if (model === undefined) {
      notifications.error(`Can not find model with identifier '${modelIdentifier}'.`);
      continue;
    }
    //
    if (model instanceof InMemorySemanticModel) {
      const result = model.executeOperation(deleteEntity(identifier));
      if (!result.success) {
        notifications.error("Can not delete entity from in memory semantic model.");
      }
    } else if (model instanceof ExternalSemanticModel) {
      try {
        await model.releaseClass(identifier);
      } catch (error) {
        console.error("Can not delete entity from external model.", error);
        notifications.error("Can not delete entity from external model.");
      }
    } else {
      notifications.error("We can not use this model type.");
      continue;
    }
  }
}
