import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel } from "./entities-of-model";

export const EntityCatalog = () => {
    const { models } = useModelGraphContext();

    return (
        <>
            <ul>
                {[...models.entries()].map(([modelId, model]) => {
                    return <EntitiesOfModel entityType="class" key={modelId + model.getAlias()} model={model} />;
                })}
            </ul>
        </>
    );
};
