import { useModelGraphContext } from "../context/graph-context";
import { EntitiesOfModel } from "./entities-of-model";

export const EntityCatalog = () => {
    const { models } = useModelGraphContext();
    return (
        <>
            <div className="h-full overflow-y-scroll">
                <div className="flex flex-row">
                    <h2>Classes:</h2>
                </div>

                <ul>
                    {[...models.entries()].map(([modelId, model]) => {
                        console.log("entity-catalog: in-return: mapping models to EntitiesOfModel");
                        return <EntitiesOfModel key={modelId} model={model} />;
                    })}
                </ul>
            </div>
        </>
    );
};
