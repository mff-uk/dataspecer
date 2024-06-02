import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel } from "./entities-of-model";

export const AttributeCatalog = () => {
    const { models } = useModelGraphContext();

    return (
        <>
            <ul>
                {[...models.entries()].map(([modelId, model]) => (
                    <EntitiesOfModel
                        entityType="attribute"
                        key={modelId + (model.getAlias() ?? "no-model-alias") + "attributes"}
                        model={model}
                    />
                ))}
            </ul>
        </>
    );
};
