import { EntityModel } from "@dataspecer/core-v2";
import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel, EntityType } from "./entity-list/entities-of-model";

export const ClassCatalog = () => {
  const { models } = useModelGraphContext();
  return (
    <ul>
      {[...models.entries()].map(([identifier, model]) => (
        <ModelClassCatalog
          key={identifier}
          model={model}
        />
      ))}
    </ul>
  );
};

function ModelClassCatalog(props: {
    model: EntityModel,
}) {
  return (
    <EntitiesOfModel
      entityType={EntityType.Class}
      model={props.model}
    />
  )
}
