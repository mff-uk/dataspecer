import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel, EntityType } from "./entity-list/entities-of-model";

export const ProfileCatalog = () => {
  const { models } = useModelGraphContext();

  return (
    <ul>
      {[...models.entries()].map(([identifier, model]) => (
        <EntitiesOfModel
          entityType={EntityType.Profile}
          key={identifier + (model.getAlias() ?? "no-model-alias") + "profiles"}
          model={model}
        />
      ))}
    </ul>
  );
};
