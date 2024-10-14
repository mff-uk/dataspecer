import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel, EntityType } from "./entity-list/entities-of-model";

export const AttributeCatalog = () => {
    const { models } = useModelGraphContext();

    return (
        <>
            <ul>
                {[...models.entries()].map(([modelId, model]) => (
                    <EntitiesOfModel
                        entityType={EntityType.Attribute}
                        key={modelId + (model.getAlias() ?? "no-model-alias") + "attributes"}
                        model={model}
                    />
                ))}
            </ul>
        </>
    );
};
