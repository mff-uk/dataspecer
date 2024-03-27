"use client";

import { useEffect, useMemo, useState } from "react";
import { AggregatedEntityWrapper, SemanticModelAggregator } from "@dataspecer/core-v2/semantic-model/aggregator";
import {
    SemanticModelRelationship,
    SemanticModelGeneralization,
    isSemanticModelClass,
    isSemanticModelGeneralization,
    isSemanticModelRelationship,
    SemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { ModelGraphContext } from "./context/model-context";
import Header from "./header";
import { Visualization } from "./visualization";
import { ClassesContext, type SemanticModelClassWithOrigin } from "./context/classes-context";
import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import { useBackendConnection } from "./backend-connection";
import { usePackageSearch } from "./util/package-search";
import { VisualEntityModel } from "@dataspecer/core-v2/visual-model";
import { Catalog } from "./catalog/catalog";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useViewParam } from "./util/view-param";
import { SupportedLanguageType, ConfigurationContext } from "./context/configuration-context";

const Page = () => {
    const [language, setLanguage] = useState<SupportedLanguageType>("en");

    const { aggregator } = useMemo(() => {
        const aggregator = new SemanticModelAggregator();
        return { aggregator };
    }, []);
    const [aggregatorView, setAggregatorView] = useState(aggregator.getView());
    const [models, setModels] = useState(new Map<string, EntityModel>());
    const [classes, setClasses] = useState(new Map<string, SemanticModelClassWithOrigin>()); //<SemanticModelClassWithOrigin[]>([]);
    const [classes2, setClasses2] = useState<SemanticModelClass[]>([]); //<SemanticModelClassWithOrigin[]>([]);
    const [allowedClasses, setAllowedClasses] = useState<string[]>([]);
    const [relationships, setRelationships] = useState<SemanticModelRelationship[]>([]);
    const [attributes, setAttributes] = useState<SemanticModelRelationship[]>([]); // useState(new Map<string, SemanticModelRelationship[]>()); // conceptId -> relationship[]
    const [generalizations, setGeneralizations] = useState<SemanticModelGeneralization[]>([]);
    const [usages, setUsages] = useState<(SemanticModelClassUsage | SemanticModelRelationshipUsage)[]>([]);
    const [visualModels, setVisualModels] = useState(new Map<string, VisualEntityModel>());
    const [sourceModelOfEntityMap, setSourceModelOfEntityMap] = useState(new Map<string, string>());

    const { packageId, setPackage } = usePackageSearch();
    const { viewId: viewIdFromURLParams } = useViewParam();
    const { getModelsFromBackend } = useBackendConnection();

    useEffect(() => {
        console.log(
            "getModelsFromBackend is going to be called from useEffect in ModelsComponent, packageId:",
            packageId
        );
        if (!packageId) return;

        const getModels = () => getModelsFromBackend(packageId);

        getModels()
            .then((models) => {
                console.log("getModels: then: models:", models);
                const [entityModels, visualModels] = models;
                for (const model of visualModels) {
                    aggregator.addModel(model);
                    setVisualModels((prev) => prev.set(model.getId(), model));
                }
                for (const model of entityModels) {
                    aggregator.addModel(model);
                    setModels((previous) => previous.set(model.getId(), model));
                }
                setAggregatorView(aggregator.getView());
            })
            .then(() => {
                const availableVisualModelIds = aggregatorView.getAvailableVisualModelIds();
                if (viewIdFromURLParams && availableVisualModelIds.includes(viewIdFromURLParams)) {
                    aggregatorView.changeActiveVisualModel(viewIdFromURLParams);
                } else {
                    // choose the first available model
                    const modelId = [...visualModels.keys()].at(0);
                    if (modelId) {
                        aggregatorView.changeActiveVisualModel(modelId);
                    }
                }
            })
            .catch((reason) => {
                alert("there was an error getting models from backend, see console");
                console.error(reason);
                setPackage(null);
            });
        return () => setModels(new Map<string, EntityModel>());
    }, [packageId]);

    useEffect(() => {
        const callback = (updated: AggregatedEntityWrapper[], removed: string[]) => {
            const removedIds = new Set(removed);
            const localSourceMap = sourceModelOfEntityMap;

            setClasses((prev) => new Map([...prev.entries()].filter((v) => !removedIds.has(v[1].cls.id))));
            setClasses2((prev) => prev.filter((v) => !removedIds.has(v.id)));
            setRelationships((prev) => prev.filter((v) => !removedIds.has(v.id)));
            setAttributes((prev) => prev.filter((v) => !removedIds.has(v.id)));
            setUsages((prev) => prev.filter((v) => !removedIds.has(v.id)));

            const { clsses, rels, atts, gens, prfiles } = updated.reduce(
                ({ clsses, rels, atts, gens, prfiles }, curr, i, arr) => {
                    if (isSemanticModelClass(curr.aggregatedEntity)) {
                        return { clsses: clsses.concat(curr.aggregatedEntity), rels, atts, gens, prfiles };
                    } else if (isSemanticModelRelationship(curr.aggregatedEntity)) {
                        if (
                            curr.aggregatedEntity.ends[1]?.concept == null ||
                            /* TODO: tohle vykuchej, az zjistis, jak to pridat spravne */ curr.aggregatedEntity.ends[1]
                                ?.concept == ""
                        ) {
                            // attribute
                            return { clsses, rels, atts: atts.concat(curr.aggregatedEntity), gens, prfiles };
                        } else {
                            // relationship
                            return { clsses, rels: rels.concat(curr.aggregatedEntity), atts, gens, prfiles };
                        }
                    } else if (
                        isSemanticModelClassUsage(curr.aggregatedEntity) ||
                        isSemanticModelRelationshipUsage(curr.aggregatedEntity)
                    ) {
                        return { clsses, rels, atts, gens, prfiles: prfiles.concat(curr.aggregatedEntity) };
                    } else if (isSemanticModelGeneralization(curr.aggregatedEntity)) {
                        return { clsses, rels, atts, gens: gens.concat(curr.aggregatedEntity), prfiles };
                    } else {
                        throw new Error(
                            `unknown type of updated entity: ${curr.aggregatedEntity?.type}, entityId: ${curr.aggregatedEntity?.id}`
                        );
                    }
                },
                {
                    clsses: [] as SemanticModelClass[],
                    rels: [] as SemanticModelRelationship[],
                    atts: [] as SemanticModelRelationship[],
                    gens: [] as SemanticModelGeneralization[],
                    prfiles: [] as (SemanticModelClassUsage | SemanticModelRelationshipUsage)[],
                }
            );

            for (const m of models.values()) {
                const modelId = m.getId();
                Object.values(m.getEntities()).forEach((e) => localSourceMap.set(e.id, modelId));
            }
            setSourceModelOfEntityMap(new Map(localSourceMap));

            console.log(clsses, rels, atts, prfiles);
            const [clssesIds, relsIds, attsIds, gensIds, prfilesIds] = [
                new Set(clsses.map((c) => c.id)),
                new Set(rels.map((r) => r.id)),
                new Set(atts.map((a) => a.id)),
                new Set(gens.map((g) => g.id)),
                new Set(prfiles.map((p) => p.id)),
            ];

            // const clsses = new Map(
            //     [...models.keys()]
            //         .map((modelId) =>
            //             Object.values(models.get(modelId)!.getEntities())
            //                 .filter(isSemanticModelClass)
            //                 .map((c) => ({ cls: c, origin: modelId }))
            //         )
            //         .flat()
            //         .map((cls) => [cls.cls.id, cls])
            // );
            // const { rels, atts } = [...models.keys()]
            //     .map((modelId) => Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelRelationship))
            //     .flat()
            //     .reduce(
            //         ({ rels, atts }, curr, i, arr) => {
            //             if (
            //                 curr.ends[1]?.concept == null ||
            //                 /* TODO: tohle vykuchej, az zjistis, jak to pridat spravne */ curr.ends[1]?.concept == ""
            //             ) {
            //                 return { rels, atts: atts.concat(curr) };
            //             }
            //             return { rels: rels.concat(curr), atts };
            //         },
            //         { rels: [] as SemanticModelRelationship[], atts: [] as SemanticModelRelationship[] }
            //     );
            // const usges = [...models.values()]
            //     .map((model) => Object.values(model.getEntities()))
            //     .map((entities) =>
            //         (
            //             entities.filter(isSemanticModelClassUsage) as (
            //                 | SemanticModelClassUsage
            //                 | SemanticModelRelationshipUsage
            //             )[]
            //         ).concat(entities.filter(isSemanticModelRelationshipUsage))
            //     )
            //     .flat();
            // console.log(usges);

            // setClasses(prev => new Map([
            // ]));
            setClasses2((prev) => prev.filter((v) => !clssesIds.has(v.id)).concat(clsses));
            setRelationships((prev) => prev.filter((v) => !relsIds.has(v.id)).concat(rels));
            setAttributes((prev) => prev.filter((v) => !attsIds.has(v.id)).concat(atts));
            setGeneralizations((prev) => prev.filter((v) => !gensIds.has(v.id)).concat(gens));
            // setGeneralizations(
            //     [...models.keys()]
            //         .map((modelId) =>
            //             Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelGeneralization)
            //         )
            //         .flat()
            // );
            setUsages((prev) => prev.filter((v) => !prfilesIds.has(v.id)).concat(prfiles));
        };
        // TODO: tady udelej nejakej chytrejsi callback
        // staci, aby se pridaly a odebraly tridy, neni potreba
        const callToUnsubscribe = aggregatorView?.subscribeToChanges(callback);

        callback([], []);
        return () => {
            callToUnsubscribe();
        };
    }, [models, aggregatorView]);

    return (
        <>
            <ConfigurationContext.Provider value={{ language, setLanguage }}>
                <ModelGraphContext.Provider
                    value={{
                        aggregator,
                        aggregatorView,
                        setAggregatorView,
                        models,
                        setModels,
                        visualModels,
                        setVisualModels,
                    }}
                >
                    <ClassesContext.Provider
                        value={{
                            classes,
                            setClasses,
                            classes2,
                            setClasses2,
                            allowedClasses,
                            setAllowedClasses,
                            relationships,
                            setRelationships,
                            attributes,
                            setAttributes,
                            generalizations,
                            setGeneralizations,
                            profiles: usages,
                            setProfiles: setUsages,
                            sourceModelOfEntityMap,
                            setSourceModelOfEntityMap,
                        }}
                    >
                        <Header />
                        {/* <MultiLanguageInputForLanguageString ls={ls} setLs={setLs} defaultLang="en" inputType="textarea" /> */}
                        <main className="h-[calc(100%-48px)] w-full bg-teal-50">
                            <div className="my-0 grid h-full grid-cols-[25%_75%] grid-rows-1">
                                <Catalog />
                                <Visualization />
                            </div>
                        </main>
                    </ClassesContext.Provider>
                </ModelGraphContext.Provider>
            </ConfigurationContext.Provider>
        </>
    );
};

export default Page;
