import { Entity } from "../../entity-model";

import { entitiesToApplicationProfile } from "./entity-model-adapter";
import { applicationProfileToTrig } from "./rdf-adapter";

export async function exportEntitiesAsDataSpecificationTrig(
  entities: Entity[]
): Promise<string> {
  const dataSpecification = entitiesToApplicationProfile(entities, null);
  return await applicationProfileToTrig(dataSpecification);
}
