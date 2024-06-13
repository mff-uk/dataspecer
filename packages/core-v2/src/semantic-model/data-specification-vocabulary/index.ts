import { entitiesToApplicationProfile, ModelContainer } from "./entity-model-adapter";
import { applicationProfileToTrig } from "./rdf-adapter";
export type {ModelContainer}from "./entity-model-adapter";

export async function exportEntitiesAsDataSpecificationTrig(
  modelContainers: ModelContainer[]
): Promise<string> {
  const dataSpecification = entitiesToApplicationProfile(modelContainers, null);
  return await applicationProfileToTrig(dataSpecification);
}
