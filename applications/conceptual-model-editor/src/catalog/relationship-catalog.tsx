import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel, EntityType } from "./entity-list/entities-of-model";

export const RelationshipCatalog = () => {
  const { models } = useModelGraphContext();

  return (
    <ul>
      {[...models.entries()].map(([identifier, model]) => (
        <EntitiesOfModel
          entityType={EntityType.Relationship}
          key={identifier + (model.getAlias() ?? "no-model-alias") + "relationships"}
          model={model}
        />
      ))}
    </ul>
  );
};
