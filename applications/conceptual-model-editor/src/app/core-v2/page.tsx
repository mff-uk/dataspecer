"use client";

import { useEffect, useMemo, useState } from "react";
import { SemanticModelAggregator } from "@dataspecer/core-v2/semantic-model/aggregator";
import { SemanticModelRelationship, SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { ModelGraphContext, getIdOfEntityModel } from "./context/graph-context";
import Header from "./header";
import { Visualization } from "./visualization";
import { ClassesContext, type SemanticModelClassWithOrigin } from "./context/classes-context";
import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import { VisualizationContext } from "./context/visualization-context";
import { useBackendConnection } from "./backend-connection";
import { usePackageSearch } from "./util/package-search";
import { ViewContext, ViewLayout } from "./context/view-context";
import { EntityCatalog } from "./catalog/entity-catalog";
import { Position } from "./visualization/position";
import { VisualEntityModel } from "@dataspecer/core-v2/visual-model";
import { ModelCatalog } from "./catalog/model-catalog";

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
    const [hideOwlThing, setHideOwlThing] = useState(false);
    const [classPositionMap, setClassPositionMap] = useState(new Map<string, Position>());
    const [activeViewId, setActiveViewId] = useState("");
    const [viewLayouts, setViewLayouts] = useState([] as ViewLayout[]);
    const [visualModels, setVisualModels] = useState(new Map<string, VisualEntityModel>());

    const { packageId, setPackage } = usePackageSearch();
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
                const activeVisModel = aggregatorView.getActiveVisualModel();
                const modelId = [...models.keys()].at(0);
                console.log("no modelId?", modelId, activeVisModel);
                if (!modelId) {
                    console.log("no modelId.");
                    return;
                }
                activeVisModel?.setColor(modelId, activeVisModel.getColor(modelId));
            })
            .catch((reason) => {
                alert("there was an error getting models from backend, see console");
                console.error(reason);
                setPackage(null);
            });
        return () => setModels(new Map<string, EntityModel>());
    }, [packageId]);

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
                    }}
                >
                    <ViewContext.Provider value={{ activeViewId, setActiveViewId, viewLayouts, setViewLayouts }}>
                        <VisualizationContext.Provider
                            value={{ hideOwlThing, setHideOwlThing, classPositionMap, setClassPositionMap }}
                        >
                            <Header />
                            <main className="h-[calc(100%-48px)] w-full bg-teal-50">
                                <div className="my-0 grid h-full grid-cols-[25%_75%] grid-rows-1">
                                    <div className="grid h-full w-full grid-cols-1 grid-rows-[20%_80%]">
                                        <ModelCatalog />
                                        <EntityCatalog />
                                    </div>
                                    <Visualization />
                                </div>
                            </main>
                        </VisualizationContext.Provider>
                    </ViewContext.Provider>
                </ClassesContext.Provider>
            </ModelGraphContext.Provider>
        </>
    );
};

export default Page;
