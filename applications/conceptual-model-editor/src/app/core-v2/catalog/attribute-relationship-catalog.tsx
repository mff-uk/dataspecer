import { useModelGraphContext } from "../context/model-context";
import { EntitiesOfModel } from "./entities-of-model";

export const AttributeCatalog = () => {
    const { models } = useModelGraphContext();

    // copied from entity-catalog
    return (
        <>
            <ul>
                {[...models.entries()].map(([modelId, model]) => {
                    // console.log("entity-catalog: in-return: mapping models to EntitiesOfModel");
                    return <EntitiesOfModel entityType="attribute" key={modelId + model.getAlias()} model={model} />;
                })}
            </ul>
        </>
    );
};

export const RelationshipCatalog = () => {
    const { models } = useModelGraphContext();

    // copied from entity-catalog
    return (
        <>
            <ul>
                {[...models.entries()].map(([modelId, model]) => {
                    // console.log("entity-catalog: in-return: mapping models to EntitiesOfModel");
                    return <EntitiesOfModel entityType="relationship" key={modelId + model.getAlias()} model={model} />;
                })}
            </ul>
        </>
    );
};
