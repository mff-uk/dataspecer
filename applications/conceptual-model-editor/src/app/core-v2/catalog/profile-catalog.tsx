import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel } from "./entities-of-model";

export const ProfileCatalog = () => {
    const { models } = useModelGraphContext();

    // copied from entity-catalog
    return (
        <>
            <ul>
                {[...models.entries()].map(([modelId, model]) => {
                    console.log("entity-catalog: in-return: mapping models to EntitiesOfModel");
                    return <EntitiesOfModel entityType="profile" key={modelId + model.getAlias()} model={model} />;
                })}
            </ul>
        </>
    );
};
