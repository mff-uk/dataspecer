import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel, EntityType } from "./entity-list/entities-of-model";

export const EntityCatalog = () => {
    const { models } = useModelGraphContext();

    return (
        <ul>
            {[...models.entries()].map(([identifier, model]) => (
                <EntitiesOfModel
                    entityType={EntityType.Class}
                    key={identifier + (model.getAlias() ?? "no-alias") + "classes"}
                    model={model}
                />
            ))}
        </ul>
    );
};
