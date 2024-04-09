import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel } from "./entities-of-model";

export const EntityCatalog = () => {
    const { models } = useModelGraphContext();

    // console.log("rerender");

    return (
        <>
            <ul>
                {[...models.entries()].map(([modelId, model]) => {
                    // console.log("entity-catalog: in-return: mapping models to EntitiesOfModel");
                    return <EntitiesOfModel entityType="class" key={modelId + model.getAlias()} model={model} />;
                })}
            </ul>
        </>
    );
};
