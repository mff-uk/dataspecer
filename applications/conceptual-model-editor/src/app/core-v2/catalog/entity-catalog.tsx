import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel } from "./components/entities-of-model";

export const EntityCatalog = () => {
    const { models } = useModelGraphContext();

    // console.log("rerender");
    // console.log("entity-catalog: in-return: mapping models to EntitiesOfModel");

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
