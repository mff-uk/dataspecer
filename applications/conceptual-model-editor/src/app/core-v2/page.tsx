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
import { InMemoryEntityModel, type EntityModel } from "@dataspecer/core-v2/entity-model";
import { useBackendConnection } from "./backend-connection";
import { usePackageSearch } from "./util/package-search";
import { VisualEntityModel, VisualEntityModelImpl } from "@dataspecer/core-v2/visual-model";
import { Catalog } from "./catalog/catalog";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useViewParam } from "./util/view-param";
import { SupportedLanguageType, ConfigurationContext } from "./context/configuration-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { bothEndsHaveAnIri } from "./util/relationship-utils";
import { Warning, WarningsContext } from "./context/warnings-context";
import { getRandomName } from "../utils/random-gen";

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
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [generalizations, setGeneralizations] = useState<SemanticModelGeneralization[]>([]);
    const [usages, setUsages] = useState<(SemanticModelClassUsage | SemanticModelRelationshipUsage)[]>([]);
    const [visualModels, setVisualModels] = useState(new Map<string, VisualEntityModel>());
    const [sourceModelOfEntityMap, setSourceModelOfEntityMap] = useState(new Map<string, string>());

    const [defaultModelAlreadyCreated, setDefaultModelAlreadyCreated] = useState(false);

    const { packageId, setPackage } = usePackageSearch();
    const { viewId: viewIdFromURLParams } = useViewParam();
    const { getModelsFromBackend } = useBackendConnection();

    useEffect(() => {
        console.log(
            "getModelsFromBackend is going to be called from useEffect in ModelsComponent, packageId:",
            packageId
        );

        if (!packageId) {
            if (defaultModelAlreadyCreated) {
                return;
            }
            const visualModel = new VisualEntityModelImpl(undefined);
            setVisualModels((prev) => prev.set(visualModel.getId(), visualModel));
            aggregator.addModel(visualModel);
            aggregatorView.changeActiveVisualModel(visualModel.getId());

            const model = new InMemorySemanticModel();
            model.setAlias("default local model");
            setModels((previous) => previous.set(model.getId(), model));
            aggregator.addModel(model);

            setDefaultModelAlreadyCreated(true);
            return () => {
                aggregator.deleteModel(visualModel);
                aggregator.deleteModel(model);
                setDefaultModelAlreadyCreated(false);
                setModels(() => new Map<string, EntityModel>());
                setVisualModels(() => new Map<string, VisualEntityModel>());
            };
        }

        const getModels = () => getModelsFromBackend(packageId);

        getModels()
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
                    setVisualModels((prev) => prev.set(model.getId(), model));
                }
                for (const model of entityModels) {
                    aggregator.addModel(model);
                    setModels((previous) => previous.set(model.getId(), model));
                }
                setAggregatorView(aggregator.getView());
                return visualModels2;
            })
            .then((vm: VisualEntityModel[]) => {
                const availableVisualModelIds = vm.map((m) => m.getId());
                if (viewIdFromURLParams && availableVisualModelIds.includes(viewIdFromURLParams)) {
                    aggregatorView.changeActiveVisualModel(viewIdFromURLParams);
                } else {
                    // choose the first available model
                    const modelId = vm.at(0)?.getId();
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
        return () => {
            console.log("models cleanup in package effect");
            setModels(new Map<string, EntityModel>());
        };
    }, [packageId]);

    useEffect(() => {
        const callback = (updated: AggregatedEntityWrapper[], removed: string[]) => {
            const removedIds = new Set(removed);
            const localSourceMap = sourceModelOfEntityMap;

            setClasses((prev) => new Map([...prev.entries()].filter((v) => !removedIds.has(v[1].cls.id))));
            setClasses2((prev) => prev.filter((v) => !removedIds.has(v.id)));
            setRelationships((prev) => prev.filter((v) => !removedIds.has(v.id)));
            setUsages((prev) => prev.filter((v) => !removedIds.has(v.id)));

            const { clsses, rels, gens, prfiles } = updated.reduce(
                ({ clsses, rels, /* atts,  */ gens, prfiles }, curr, i, arr) => {
                    if (isSemanticModelClass(curr.aggregatedEntity)) {
                        return { clsses: clsses.concat(curr.aggregatedEntity), rels, /*  atts, */ gens, prfiles };
                    } else if (isSemanticModelRelationship(curr.aggregatedEntity)) {
                        if (bothEndsHaveAnIri(curr.aggregatedEntity)) {
                            console.warn(
                                "both ends have an IRI, skipping",
                                curr.aggregatedEntity,
                                curr.aggregatedEntity.ends
                            );
                            setWarnings((prev) =>
                                prev.concat({
                                    id: getRandomName(10),
                                    type: "unsupported-relationship",
                                    message: "both ends have an IRI",
                                    object: curr.aggregatedEntity,
                                })
                            );
                            return { clsses, rels, gens, prfiles };
                        }
                        return { clsses, rels: rels.concat(curr.aggregatedEntity), /* atts, */ gens, prfiles };
                    } else if (
                        isSemanticModelClassUsage(curr.aggregatedEntity) ||
                        isSemanticModelRelationshipUsage(curr.aggregatedEntity)
                    ) {
                        return { clsses, rels, /* atts, */ gens, prfiles: prfiles.concat(curr.aggregatedEntity) };
                    } else if (isSemanticModelGeneralization(curr.aggregatedEntity)) {
                        return { clsses, rels, /* atts, */ gens: gens.concat(curr.aggregatedEntity), prfiles };
                    } else {
                        throw new Error(
                            `unknown type of updated entity: ${curr.aggregatedEntity?.type}, entityId: ${curr.aggregatedEntity?.id}`
                        );
                    }
                },
                {
                    clsses: [] as SemanticModelClass[],
                    rels: [] as SemanticModelRelationship[],
                    gens: [] as SemanticModelGeneralization[],
                    prfiles: [] as (SemanticModelClassUsage | SemanticModelRelationshipUsage)[],
                }
            );

            for (const m of models.values()) {
                const modelId = m.getId();
                Object.values(m.getEntities()).forEach((e) => localSourceMap.set(e.id, modelId));
            }
            setSourceModelOfEntityMap(new Map(localSourceMap));

            const [clssesIds, relsIds, /* attsIds, */ gensIds, prfilesIds] = [
                new Set(clsses.map((c) => c.id)),
                new Set(rels.map((r) => r.id)),
                new Set(gens.map((g) => g.id)),
                new Set(prfiles.map((p) => p.id)),
            ];

            setClasses2((prev) => prev.filter((v) => !clssesIds.has(v.id)).concat(clsses));
            setRelationships((prev) => prev.filter((v) => !relsIds.has(v.id)).concat(rels));
            setGeneralizations((prev) => prev.filter((v) => !gensIds.has(v.id)).concat(gens));
            setUsages((prev) => prev.filter((v) => !prfilesIds.has(v.id)).concat(prfiles));
        };
        // TODO: tady udelej nejakej chytrejsi callback
        // staci, aby se pridaly a odebraly tridy, neni potreba
        const callToUnsubscribe = aggregatorView?.subscribeToChanges(callback);

        callback([], []);
        return () => {
            callToUnsubscribe();
        };
    }, [, /* models */ aggregatorView]);

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
                            generalizations,
                            setGeneralizations,
                            profiles: usages,
                            setProfiles: setUsages,
                            sourceModelOfEntityMap,
                            setSourceModelOfEntityMap,
                        }}
                    >
                        <WarningsContext.Provider value={{ warnings, setWarnings }}>
                            <Header />
                            <main className="h-[calc(100%-48px)] w-full bg-teal-50">
                                <div className="my-0 grid h-full grid-cols-[25%_75%] grid-rows-1">
                                    <Catalog />
                                    <Visualization />
                                </div>
                            </main>
                        </WarningsContext.Provider>
                    </ClassesContext.Provider>
                </ModelGraphContext.Provider>
            </ConfigurationContext.Provider>
        </>
    );
};

export default Page;
