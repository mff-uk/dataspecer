"use client";

import { useEffect, useState } from "react";
import type { Entity, EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { type VisualEntityModel, VisualEntityModelImpl } from "@dataspecer/core-v2/visual-model";
import { type AggregatedEntityWrapper, SemanticModelAggregator } from "@dataspecer/core-v2/semantic-model/aggregator";
import {
    type SemanticModelClass,
    type SemanticModelRelationship,
    type SemanticModelGeneralization,
    isSemanticModelClass,
    isSemanticModelGeneralization,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ClassesContext } from "./context/classes-context";
import { ModelGraphContext } from "./context/model-context";
import { type SupportedLanguageType, ConfigurationContext } from "./context/configuration-context";
import { type Warning, WarningsContext } from "./context/warnings-context";
import Header from "./header";
import { useBackendConnection } from "./backend-connection";
import { Catalog } from "./catalog/catalog";
import { Visualization } from "./visualization";
import { bothEndsHaveAnIri } from "./util/relationship-utils";
import { getRandomName } from "./util/random-gen";
import { DialogsContextProvider } from "./context/dialogs-context";
import { QueryParamsProvider, useQueryParamsContext } from "./context/query-params-context";

const Page = () => {
    const [language, setLanguage] = useState<SupportedLanguageType>("en");

    const [aggregator, setAggregator] = useState(new SemanticModelAggregator());
    const [aggregatorView, setAggregatorView] = useState(aggregator.getView());
    const [models, setModels] = useState(new Map<string, EntityModel>());
    const [classes, setClasses] = useState<SemanticModelClass[]>([]);
    const [allowedClasses, setAllowedClasses] = useState<string[]>([]);
    const [relationships, setRelationships] = useState<SemanticModelRelationship[]>([]);
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [generalizations, setGeneralizations] = useState<SemanticModelGeneralization[]>([]);
    const [usages, setUsages] = useState<(SemanticModelClassUsage | SemanticModelRelationshipUsage)[]>([]);
    const [rawEntities, setRawEntities] = useState<(Entity | null)[]>([]);
    const [visualModels, setVisualModels] = useState(new Map<string, VisualEntityModel>());
    const [sourceModelOfEntityMap, setSourceModelOfEntityMap] = useState(new Map<string, string>());

    const [defaultModelAlreadyCreated, setDefaultModelAlreadyCreated] = useState(false);

    const { packageId, viewId, updatePackageId } = useQueryParamsContext();
    const { getModelsFromBackend } = useBackendConnection();

    useEffect(() => {
        const pId = packageId;
        console.log("getModelsFromBackend is going to be called from useEffect in ModelsComponent, pId:", pId);

        if (!pId) {
            console.log("page: packageId not set");

            if (defaultModelAlreadyCreated) {
                console.log(
                    "page: returning from useEffect, default model already created",
                    defaultModelAlreadyCreated
                );
                return;
            }
            console.log("page: gonna create new default model", defaultModelAlreadyCreated);

            const aggr = new SemanticModelAggregator();
            const aggrView = aggr.getView();
            const visualModel = new VisualEntityModelImpl(undefined);
            setVisualModels(new Map([[visualModel.getId(), visualModel]]));
            aggr.addModel(visualModel);
            aggrView.changeActiveVisualModel(visualModel.getId());

            const model = new InMemorySemanticModel();
            model.setAlias("default local model");
            setModels(new Map([[model.getId(), model]]));
            aggr.addModel(model);

            setDefaultModelAlreadyCreated(true);
            setAggregator(aggr);
            setAggregatorView(aggrView);
            return () => {
                setDefaultModelAlreadyCreated(false);
                setModels(() => new Map<string, EntityModel>());
                setVisualModels(() => new Map<string, VisualEntityModel>());
            };
        }

        const getModels = () => getModelsFromBackend(pId);

        const cleanup = getModels()
            .then((models) => {
                console.log("getModels: then: models:", models);
                const [entityModels, visualModels2] = models;
                if (entityModels.length == 0 && visualModels2.length == 0) {
                    console.log("empty models from backend", entityModels, visualModels2);

                    const visualModel = new VisualEntityModelImpl(undefined);
                    visualModels2.push(visualModel);

                    const model = new InMemorySemanticModel();
                    model.setAlias("default local model");
                    entityModels.push(model);
                }
                if (!entityModels.find((m) => m instanceof InMemorySemanticModel)) {
                    const model = new InMemorySemanticModel();
                    model.setAlias("default local model");
                    entityModels.push(model);
                }

                for (const model of visualModels2) {
                    aggregator.addModel(model);
                }
                for (const model of entityModels) {
                    aggregator.addModel(model);
                }

                setVisualModels(new Map(visualModels2.map((m) => [m.getId(), m])));
                setModels(new Map(entityModels.map((m) => [m.getId(), m])));

                const aggrView = aggregator.getView();
                const availableVisualModelIds = visualModels2.map((m) => m.getId());

                if (viewId && availableVisualModelIds.includes(viewId)) {
                    aggrView.changeActiveVisualModel(viewId);
                } else {
                    // choose the first available model
                    const modelId = visualModels2.at(0)?.getId();
                    if (modelId) {
                        aggrView.changeActiveVisualModel(modelId);
                    }
                }

                setAggregatorView(aggrView);
                return () => {
                    for (const m of [...entityModels, ...visualModels2]) {
                        try {
                            aggregator.deleteModel(m);
                        } catch (err) {
                            console.log("error: trying delete a model from aggregator", err);
                        }
                    }
                    setModels(new Map());
                    setVisualModels(new Map());
                };
            })
            .catch((reason) => {
                console.error(reason);
                updatePackageId(null);
            });

        return async () => {
            console.log("models cleanup in package effect");
            (await cleanup)?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const callback = (updated: AggregatedEntityWrapper[], removed: string[]) => {
            console.log("page.tsx callback, updated, removed", updated, removed);
            const removedIds = new Set(removed);
            const localSourceMap = sourceModelOfEntityMap;

            setClasses((prev) => prev.filter((v) => !removedIds.has(v.id)));
            setRelationships((prev) => prev.filter((v) => !removedIds.has(v.id)));
            setUsages((prev) => prev.filter((v) => !removedIds.has(v.id)));
            setGeneralizations((prev) => prev.filter((v) => !removedIds.has(v.id)));
            setRawEntities((prev) => prev.filter((r) => r?.id && !removedIds.has(r?.id)));

            const { clsses, rels, gens, prfiles, raws } = updated.reduce(
                ({ clsses, rels, gens, prfiles, raws }, curr) => {
                    if (isSemanticModelClass(curr.aggregatedEntity)) {
                        return {
                            clsses: clsses.concat(curr.aggregatedEntity),
                            rels,
                            gens,
                            prfiles,
                            raws: raws.concat(curr.rawEntity),
                        };
                    } else if (isSemanticModelRelationship(curr.aggregatedEntity)) {
                        if (bothEndsHaveAnIri(curr.aggregatedEntity)) {
                            console.warn(
                                "both ends have an IRI, skipping",
                                curr.aggregatedEntity,
                                curr.aggregatedEntity.ends
                            );
                            setWarnings((prev) =>
                                prev.concat({
                                    id: getRandomName(15),
                                    type: "unsupported-relationship",
                                    message: "both ends have an IRI",
                                    object: curr.aggregatedEntity,
                                })
                            );
                            return { clsses, rels, gens, prfiles, raws: raws.concat(curr.rawEntity) };
                        }
                        return {
                            clsses,
                            rels: rels.concat(curr.aggregatedEntity),
                            gens,
                            prfiles,
                            raws: raws.concat(curr.rawEntity),
                        };
                    } else if (
                        isSemanticModelClassUsage(curr.aggregatedEntity) ||
                        isSemanticModelRelationshipUsage(curr.aggregatedEntity)
                    ) {
                        return {
                            clsses,
                            rels,
                            gens,
                            prfiles: prfiles.concat(curr.aggregatedEntity),
                            raws: raws.concat(curr.rawEntity),
                        };
                    } else if (isSemanticModelGeneralization(curr.aggregatedEntity)) {
                        return {
                            clsses,
                            rels,
                            gens: gens.concat(curr.aggregatedEntity),
                            prfiles,
                            raws: raws.concat(curr.rawEntity),
                        };
                    } else {
                        console.error(
                            "unknown type of updated entity: ",
                            curr.aggregatedEntity?.type,
                            curr.aggregatedEntity?.id
                        );
                        throw new Error("unknown type of updated entity");
                    }
                },
                {
                    clsses: [] as SemanticModelClass[],
                    rels: [] as SemanticModelRelationship[],
                    gens: [] as SemanticModelGeneralization[],
                    prfiles: [] as (SemanticModelClassUsage | SemanticModelRelationshipUsage)[],
                    raws: [] as (Entity | null)[],
                }
            );

            for (const m of models.values()) {
                const modelId = m.getId();
                Object.values(m.getEntities()).forEach((e) => localSourceMap.set(e.id, modelId));
            }
            setSourceModelOfEntityMap(new Map(localSourceMap));

            const [clssesIds, relsIds, gensIds, prfilesIds, rawsIds] = [
                new Set(clsses.map((c) => c.id)),
                new Set(rels.map((r) => r.id)),
                new Set(gens.map((g) => g.id)),
                new Set(prfiles.map((p) => p.id)),
                new Set(raws.map((r) => r?.id)),
            ];

            setClasses((prev) => prev.filter((v) => !clssesIds.has(v.id)).concat(clsses));
            setRelationships((prev) => prev.filter((v) => !relsIds.has(v.id)).concat(rels));
            setGeneralizations((prev) => prev.filter((v) => !gensIds.has(v.id)).concat(gens));
            setUsages((prev) => prev.filter((v) => !prfilesIds.has(v.id)).concat(prfiles));
            setRawEntities((prev) => prev.filter((r) => !rawsIds.has(r?.id)).concat(raws));
        };
        const callToUnsubscribe = aggregatorView?.subscribeToChanges(callback);

        callback([], []);
        return () => {
            callToUnsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aggregatorView]);

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
                            allowedClasses,
                            setAllowedClasses,
                            relationships,
                            setRelationships,
                            generalizations,
                            setGeneralizations,
                            profiles: usages,
                            setProfiles: setUsages,
                            sourceModelOfEntityMap,
                            setSourceModelOfEntityMap,
                            rawEntities,
                            setRawEntities,
                        }}
                    >
                        <WarningsContext.Provider value={{ warnings, setWarnings }}>
                            <DialogsContextProvider>
                                <Header />
                                <main className="w-full flex-grow bg-teal-50  md:h-[calc(100%-48px)]">
                                    <div className="my-0 grid grid-rows-[auto_fit] md:h-full md:grid-cols-[25%_75%] md:grid-rows-1 ">
                                        <Catalog />
                                        <Visualization />
                                    </div>
                                </main>
                            </DialogsContextProvider>
                        </WarningsContext.Provider>
                    </ClassesContext.Provider>
                </ModelGraphContext.Provider>
            </ConfigurationContext.Provider>
        </>
    );
};

const PageWrapper = () => {
    return (
        <QueryParamsProvider>
            <Page />
        </QueryParamsProvider>
    );
};

export default PageWrapper;
