"use client";

import { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";

import type { Entity, EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { type WritableVisualModel } from "@dataspecer/core-v2/visual-model";
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
import Header from "./header/header";
import { useBackendConnection } from "./backend-connection";
import { Catalog } from "./catalog/catalog";
import { Visualization } from "./visualization";
import { bothEndsHaveAnIri } from "./util/relationship-utils";
import { getRandomName } from "../utils/random-gen";
import { DialogsContextProvider } from "./context/dialogs-context";
import { QueryParamsProvider, useQueryParamsContext } from "./context/query-params-context";
import { DialogContextProvider } from "./dialog/dialog-context";
import { DialogRenderer } from "./dialog/dialog-renderer";
import { NotificationList } from "./notification";
import { ActionsContextProvider } from "./action/actions-react-binding";

import "./page.css";
import { createWritableVisualModel } from "./util/visual-model-utils";

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
    const [visualModels, setVisualModels] = useState(new Map<string, WritableVisualModel>());
    const [sourceModelOfEntityMap, setSourceModelOfEntityMap] = useState(new Map<string, string>());

    const [defaultModelAlreadyCreated, setDefaultModelAlreadyCreated] = useState(false);

    const { packageId, viewId, updatePackageId } = useQueryParamsContext();
    const { getModelsFromBackend } = useBackendConnection();

    // runs on initial load
    // if the app was launched without package-id query parameter
    // - creates a default entity model
    // - creates a view for it
    // - registers it with the aggregator
    // else -- the package-id (and view-id) params were provided
    // - downloads the models and views for given package from the backend
    // - deserializes them
    // - registers them at the aggregator
    // - if there was no local model within the package, it creates and registers one as well
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

            const tempAggregator = new SemanticModelAggregator();
            const tempAggregatorView = tempAggregator.getView();
            const visualModel = createWritableVisualModel();
            setVisualModels(new Map([[visualModel.getId(), visualModel]]));
            tempAggregator.addModel(visualModel);
            tempAggregatorView.changeActiveVisualModel(visualModel.getId());

            const model = new InMemorySemanticModel();
            model.setAlias("default local model");
            setModels(new Map([[model.getId(), model]]));
            tempAggregator.addModel(model);

            setDefaultModelAlreadyCreated(true);
            setAggregator(tempAggregator);
            setAggregatorView(tempAggregatorView);
            return () => {
                setDefaultModelAlreadyCreated(false);
                setModels(() => new Map<string, EntityModel>());
                setVisualModels(() => new Map<string, WritableVisualModel>());
            };
        }

        const getModels = () => getModelsFromBackend(pId);

        const cleanup = getModels()
            .then((models) => {
                console.log("getModels: then: models:", models);
                const [entityModels, visualModels2] = models;
                if (entityModels.length == 0 && visualModels2.length == 0) {
                    console.log("empty models from backend", entityModels, visualModels2);

                    const visualModel = createWritableVisualModel();
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

                setVisualModels(new Map(visualModels2.map((m) => [m.getId(), m as WritableVisualModel])));
                setModels(new Map(entityModels.map((m) => [m.getId(), m])));

                const tempAggregatorView = aggregator.getView();
                const availableVisualModelIds = visualModels2.map((m) => m.getId());

                if (viewId && availableVisualModelIds.includes(viewId)) {
                    tempAggregatorView.changeActiveVisualModel(viewId);
                } else {
                    // choose the first available model
                    const modelId = visualModels2.at(0)?.getId();
                    if (modelId) {
                        tempAggregatorView.changeActiveVisualModel(modelId);
                    }
                }

                setAggregatorView(tempAggregatorView);
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

    // registers a subscription callback at the aggregator, that:
    // - removes whatever was removed from the models registered at the aggregator from the `ClassContext`
    // - goes through the updated elements
    // - based on their types puts them to their respective buckets - classes, relationships, etc
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

            const {
                updatedClasses,
                updatedRelationships,
                updatedGeneralizations,
                updatedProfiles,
                updatedRawEntities,
            } = updated.reduce(
                (
                    {
                        updatedClasses,
                        updatedRelationships,
                        updatedGeneralizations,
                        updatedProfiles,
                        updatedRawEntities,
                    },
                    curr
                ) => {
                    if (isSemanticModelClass(curr.aggregatedEntity)) {
                        return {
                            updatedClasses: updatedClasses.concat(curr.aggregatedEntity),
                            updatedRelationships,
                            updatedGeneralizations,
                            updatedProfiles,
                            updatedRawEntities: updatedRawEntities.concat(curr.rawEntity),
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
                            return {
                                updatedClasses,
                                updatedRelationships,
                                updatedGeneralizations,
                                updatedProfiles,
                                updatedRawEntities: updatedRawEntities.concat(curr.rawEntity),
                            };
                        }
                        return {
                            updatedClasses,
                            updatedRelationships: updatedRelationships.concat(curr.aggregatedEntity),
                            updatedGeneralizations,
                            updatedProfiles,
                            updatedRawEntities: updatedRawEntities.concat(curr.rawEntity),
                        };
                    } else if (
                        isSemanticModelClassUsage(curr.aggregatedEntity) ||
                        isSemanticModelRelationshipUsage(curr.aggregatedEntity)
                    ) {
                        return {
                            updatedClasses,
                            updatedRelationships,
                            updatedGeneralizations,
                            updatedProfiles: updatedProfiles.concat(curr.aggregatedEntity),
                            updatedRawEntities: updatedRawEntities.concat(curr.rawEntity),
                        };
                    } else if (isSemanticModelGeneralization(curr.aggregatedEntity)) {
                        return {
                            updatedClasses,
                            updatedRelationships,
                            updatedGeneralizations: updatedGeneralizations.concat(curr.aggregatedEntity),
                            updatedProfiles,
                            updatedRawEntities: updatedRawEntities.concat(curr.rawEntity),
                        };
                    } else {
                        console.error("Unknown type of updated entity", curr.aggregatedEntity);
                        throw new Error("Unknown type of updated entity.");
                    }
                },
                {
                    updatedClasses: [] as SemanticModelClass[],
                    updatedRelationships: [] as SemanticModelRelationship[],
                    updatedGeneralizations: [] as SemanticModelGeneralization[],
                    updatedProfiles: [] as (SemanticModelClassUsage | SemanticModelRelationshipUsage)[],
                    updatedRawEntities: [] as (Entity | null)[],
                }
            );

            for (const m of models.values()) {
                const modelId = m.getId();
                Object.values(m.getEntities()).forEach((e) => localSourceMap.set(e.id, modelId));
            }
            setSourceModelOfEntityMap(new Map(localSourceMap));

            const [
                updatedClassIds,
                updatedRelationshipIds,
                updatedGeneralizationIds,
                updatedProfileIds,
                updatedRawEntityIds,
            ] = [
                    new Set(updatedClasses.map((c) => c.id)),
                    new Set(updatedRelationships.map((r) => r.id)),
                    new Set(updatedGeneralizations.map((g) => g.id)),
                    new Set(updatedProfiles.map((p) => p.id)),
                    new Set(updatedRawEntities.map((r) => r?.id)),
                ];

            setClasses((prev) => prev.filter((v) => !updatedClassIds.has(v.id)).concat(updatedClasses));
            setRelationships((prev) =>
                prev.filter((v) => !updatedRelationshipIds.has(v.id)).concat(updatedRelationships)
            );
            setGeneralizations((prev) =>
                prev.filter((v) => !updatedGeneralizationIds.has(v.id)).concat(updatedGeneralizations)
            );
            setUsages((prev) => prev.filter((v) => !updatedProfileIds.has(v.id)).concat(updatedProfiles));
            setRawEntities((prev) => prev.filter((r) => !updatedRawEntityIds.has(r?.id)).concat(updatedRawEntities));
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
                            <DialogContextProvider>
                                <ActionsContextProvider>
                                    <DialogsContextProvider>
                                        <Header />
                                        <main className="w-full flex-grow bg-teal-50  md:h-[calc(100%-48px)]">
                                            <div className="my-0 grid grid-rows-[auto_fit] md:h-full md:grid-cols-[25%_75%] md:grid-rows-1 ">
                                                <Catalog />
                                                <Visualization />
                                            </div>
                                        </main>

                                        <NotificationList />
                                        <DialogRenderer />
                                    </DialogsContextProvider>
                                </ActionsContextProvider>
                            </DialogContextProvider>
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
            <ReactFlowProvider>
                <Page />
            </ReactFlowProvider>
        </QueryParamsProvider>
    );
};

export default PageWrapper;
