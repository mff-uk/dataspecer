import type { ModelGraphContextType } from "../context/model-context";
import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { deleteEntity } from "@dataspecer/core-v2/semantic-model/operations";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";

export function createNewVisualModelFromSelectionAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  selectionIdentifiers: string[],
) {
  // TODO RadStr: Implement me
}
