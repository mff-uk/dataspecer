import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel } from "./components/entities-of-model";

export const RelationshipCatalog = () => {
    const { models } = useModelGraphContext();

    return (
        <>
            <ul>
                {[...models.entries()].map(([modelId, model]) => (
                    <EntitiesOfModel
                        entityType="relationship"
                        key={modelId + (model.getAlias() ?? "no-model-alias") + "relationships"}
                        model={model}
                    />
                ))}
            </ul>
        </>
    );
};
