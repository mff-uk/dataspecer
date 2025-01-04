import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { shortenStringTo } from "./utils";
import { getModelIri } from "./iri-utils";

export const sourceModelOfEntity = (entityId: string, models: EntityModel[]) => {
  return models.find((m) => Object.keys(m.getEntities()).find((eId) => eId === entityId));
};

export const sourceModelIdOfEntity = (entityId: string, sourceMap: Map<string, string>) => {
  return sourceMap.get(entityId);
};

export const filterInMemoryModels = (models: EntityModel[]) => {
  return models.filter((m): m is InMemorySemanticModel => m instanceof InMemorySemanticModel);
};

/**
 * Returns model type as a string to be shown in an entity detail for example.
 * @param model
 * @returns
 */
export const getModelType = (model: EntityModel | undefined | null) => {
  if (model instanceof InMemorySemanticModel) {
    return "local model";
  } else if (model instanceof ExternalSemanticModel) {
    return "external (sgov)";
  } else {
    return "from .ttl";
  }
};

export const getModelDetails = (model: EntityModel) => {
  const id = model.getId();
  const alias = model.getAlias();
  const type = getModelType(model);
  const baseIri = getModelIri(model);
  const displayName = alias ?? shortenStringTo(id ?? null);
  return {
    id,
    alias,
    type,
    baseIri,
    displayName,
  };
};
