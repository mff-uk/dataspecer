import { type Entities, type EntityModel } from "@dataspecer/core-v2/entity-model";

import { t } from "../application/";
import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { EntityProxy } from "../util/detail-utils";
import { getDuplicateNames } from "../util/name-utils";

type SemanticEntity = SemanticModelClass
  | SemanticModelRelationship
  | SemanticModelClassUsage
  | SemanticModelRelationshipUsage;

/**
 * Given a model create human readable label.
 * Since there is only one label it does not consider languages.
 */
export function getModelLabel(model: EntityModel): string {
  const alias = model.getAlias();
  if (alias !== null) {
    return alias;
  }
  return t("model-service.model-label-from-id", model.getId());
}

export const findSourceModelOfEntity = (entityIdentifier: string, models: Map<string, EntityModel>): EntityModel | null => {
  for (const model of models.values()) {
    const entities: Entities = model.getEntities();
    if (entities[entityIdentifier] === undefined) {
      continue;
    }
    return model;
  }
  return null;
};

interface OptionItem {
  id: string;
  label: string;
}

/**
 * Given list of entities prepare them for listing in the options HTML element.
 * The list is sorted using label in ascending order locally.
 */
export const prepareClassAndClassUsageForSelect = (entities: SemanticEntity[]): OptionItem[] => {
  const result: OptionItem[] = [];
  const duplicateNames = getDuplicateNames(entities);

  for (const item of entities) {
    const { name, iri, model } = EntityProxy(item);
    const displayIri = duplicateNames.has(name ?? "");

    const nameLabel = name ?? "";
    const modelLabel = model === null ? "" : `[${getModelLabel(model)}]`;
    const iriLabel = displayIri && iri !== null ? `(${iri})` : "";

    result.push({
      id: item.id,
      label: `${nameLabel} ${modelLabel} ${iriLabel}`,
    });
  }

  result.sort((left, right) => left.label.localeCompare(right.label));

  return result;
};
