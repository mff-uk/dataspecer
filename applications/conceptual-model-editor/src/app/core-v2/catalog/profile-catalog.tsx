import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel } from "./entities-of-model";

export const ProfileCatalog = () => {
    const { models } = useModelGraphContext();

    return (
        <>
            <ul>
                {[...models.entries()].map(([modelId, model]) => {
                    return <EntitiesOfModel entityType="profile" key={modelId + model.getAlias()} model={model} />;
                })}
            </ul>
        </>
    );
};
