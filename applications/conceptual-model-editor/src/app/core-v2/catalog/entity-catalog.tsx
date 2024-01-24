import {
    isSemanticModelClass,
    isSemanticModelRelationship,
    isSemanticModelGeneralization,
    SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useEffect } from "react";
import { useClassesContext } from "../context/classes-context";
import { useModelGraphContext } from "../context/graph-context";
import { EntitiesOfModel } from "./entities-of-model";
import { Entity } from "@dataspecer/core-v2/entity-model";
import { VisualEntity } from "@dataspecer/core-v2/visual-model";

// TODO: jen naimportuj, udelej export v aggregator.ts
interface AggregatedEntityWrapper {
    id: string;
    aggregatedEntity: Entity | null;
    visualEntity: VisualEntity | null;
}

export const EntityCatalog = () => {
    const { aggregatorView, models } = useModelGraphContext();
    const { setClasses, setRelationships, setGeneralizations, setAttributes } = useClassesContext();

    useEffect(() => {
        const callback = (updated: AggregatedEntityWrapper[], removed: string[]) => {
            console.log("entity-catalog: subscribe callback: updated&removed", updated, removed);

            setClasses(
                new Map(
                    [...models.keys()]
                        .map((modelId) =>
                            Object.values(models.get(modelId)!.getEntities())
                                .filter(isSemanticModelClass)
                                .map((c) => ({ cls: c, origin: modelId }))
                        )
                        .flat()
                        .map((cls) => [cls.cls.id, cls])
                )
            );
            const { rels, atts } = [...models.keys()]
                .map((modelId) => Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelRelationship))
                .flat()
                .reduce(
                    ({ rels, atts }, curr, i, arr) => {
                        if (
                            curr.ends[1]?.concept == null ||
                            /* TODO: tohle vykuchej, az zjistis, jak to pridat spravne */ curr.ends[1]?.concept == ""
                        ) {
                            return { rels, atts: atts.concat(curr) };
                        }
                        return { rels: rels.concat(curr), atts };
                    },
                    { rels: [] as SemanticModelRelationship[], atts: [] as SemanticModelRelationship[] }
                );
            console.log("rels & atts: ", rels, atts);
            setRelationships(rels);
            setAttributes(atts);
            setGeneralizations(
                [...models.keys()]
                    .map((modelId) =>
                        Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelGeneralization)
                    )
                    .flat()
            );
        };
        // TODO: tady udelej nejakej chytrejsi callback
        // staci, aby se pridaly a odebraly tridy, neni potreba
        const callToUnsubscribe = aggregatorView?.subscribeToChanges(callback);

        callback([], []);
        return callToUnsubscribe;
    }, [models, aggregatorView]);

    console.log("entity-catalog: full rerender");

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