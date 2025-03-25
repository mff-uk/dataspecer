import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createGeneralization, deleteEntity, Operation } from "@dataspecer/core-v2/semantic-model/operations";
import { CmeReference, CmeSpecialization, isCmeReferenceEqual, isCmeSpecialization, NewCmeSpecialization } from "../model";
import { createLogger } from "../../../application";

const LOG = createLogger(import.meta.url);

/**
 * This operation works with multiple models.
 *
 * @param writeModel Model to create new entities into.
 * @throws DataspecerError
 */
export function updateCmeSpecialization(
  models: InMemorySemanticModel[],
  writeModel: InMemorySemanticModel,
  entity: CmeReference,
  previous: (NewCmeSpecialization | CmeSpecialization)[],
  next: (NewCmeSpecialization | CmeSpecialization)[],
): void {
  const operations: Operation[] = [];
  const nextGeneralizations: CmeReference[] = [];
  // Create new.
  for (const item of next) {
    if (isCmeSpecialization(item)) {
      // This is already existing specialization, we store it for later.
      nextGeneralizations.push(item.generalization);
      continue;
    }
    // Create a new generalization.
    operations.push(createGeneralization({
      iri: item.iri,
      parent: item.specializationOf.identifier,
      child: entity.identifier,
    }));
  }
  writeModel.executeOperations(operations);
  // Remove old that are not part of next.
  for (const item of previous) {
    if (!isCmeSpecialization(item)) {
      // Not sure how this happened, we just ignore it.
      continue;
    }
    // Search if it is is missing in next.
    const matching = nextGeneralizations.find(
      existing => isCmeReferenceEqual(existing, item.generalization));
    if (matching !== undefined) {
      // There is matching in next so we do not remove.
      continue;
    }
    // We need to remove it from the respective model.
    const model = models.find(
      model => model.getId() === item.generalization.model);
    if (model === undefined) {
      LOG.error("Can not find model to delete a specialization.",
        {specialization: item});
      continue;
    }
    model.executeOperation(deleteEntity(item.generalization.identifier));
  }
}
