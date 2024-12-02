import type { ModelGraphContextType } from "../context/model-context";
import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { deleteEntity } from "@dataspecer/core-v2/semantic-model/operations";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";

export function createNewVisualModelFromSelectionAction(
  selectionIdentifiers: string[],
  keepPositionsFromCurrentVisualModel: boolean,
  graph: ModelGraphContextType,
  notifications: UseNotificationServiceWriterType,
) {
  // TODO: Implement me
}
