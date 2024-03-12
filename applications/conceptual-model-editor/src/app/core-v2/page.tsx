"use client";

import { useEffect, useMemo, useState } from "react";
import { AggregatedEntityWrapper, SemanticModelAggregator } from "@dataspecer/core-v2/semantic-model/aggregator";
import {
    SemanticModelRelationship,
    SemanticModelGeneralization,
    isSemanticModelClass,
    isSemanticModelGeneralization,
    isSemanticModelRelationship,
    LanguageString,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { ModelGraphContext } from "./context/model-context";
import Header from "./header";
import { Visualization } from "./visualization";
import { ClassesContext, type SemanticModelClassWithOrigin } from "./context/classes-context";
import { Entity, type EntityModel } from "@dataspecer/core-v2/entity-model";
import { useBackendConnection } from "./backend-connection";
import { usePackageSearch } from "./util/package-search";
import { VisualEntityModel } from "@dataspecer/core-v2/visual-model";
import { randomColorFromPalette } from "../utils/color-utils";
import { Catalog } from "./catalog/catalog";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useLocalStorage } from "./util/export-utils";
import { useViewParam } from "./util/view-param";
import { MultiLanguageInputForLanguageString } from "./dialog/multi-language-input-4-language-string";

const Page = () => {
    const { aggregator } = useMemo(() => {
        const aggregator = new SemanticModelAggregator();
        return { aggregator };
    }, []);
    const [aggregatorView, setAggregatorView] = useState(aggregator.getView());
    const [models, setModels] = useState(new Map<string, EntityModel>());
    const [classes, setClasses] = useState(new Map<string, SemanticModelClassWithOrigin>()); //<SemanticModelClassWithOrigin[]>([]);
    const [allowedClasses, setAllowedClasses] = useState<string[]>([]);
    const [relationships, setRelationships] = useState<SemanticModelRelationship[]>([]);
    const [attributes, setAttributes] = useState<SemanticModelRelationship[]>([]); // useState(new Map<string, SemanticModelRelationship[]>()); // conceptId -> relationship[]
    const [generalizations, setGeneralizations] = useState<SemanticModelGeneralization[]>([]);
    const [usages, setUsages] = useState<(SemanticModelClassUsage | SemanticModelRelationshipUsage)[]>([]);
    const [visualModels, setVisualModels] = useState(new Map<string, VisualEntityModel>());

    const { packageId, setPackage } = usePackageSearch();
    const { viewId: viewIdFromURLParams } = useViewParam();
    const { getModelsFromBackend } = useBackendConnection();
    const { getWorkspaceState, saveWorkspaceState } = useLocalStorage();

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
            const clsses = new Map(
                [...models.keys()]
                    .map((modelId) =>
                        Object.values(models.get(modelId)!.getEntities())
                            .filter(isSemanticModelClass)
                            .map((c) => ({ cls: c, origin: modelId }))
                    )
                    .flat()
                    .map((cls) => [cls.cls.id, cls])
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
            const usges = [...models.values()]
                .map((model) => Object.values(model.getEntities()))
                .map((entities) =>
                    (
                        entities.filter(isSemanticModelClassUsage) as (
                            | SemanticModelClassUsage
                            | SemanticModelRelationshipUsage
                        )[]
                    ).concat(entities.filter(isSemanticModelRelationshipUsage))
                )
                .flat();
            console.log(usges);
            setClasses(clsses);
            setRelationships(rels);
            setAttributes(atts);
            setGeneralizations(
                [...models.keys()]
                    .map((modelId) =>
                        Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelGeneralization)
                    )
                    .flat()
            );
            setUsages(usges);
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
                        attributes,
                        setAttributes,
                        generalizations,
                        setGeneralizations,
                        usages,
                        setUsages,
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
        </>
    );
};

export default Page;
