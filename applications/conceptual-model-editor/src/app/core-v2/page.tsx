"use client";

import { useEffect, useMemo, useState } from "react";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { SemanticModelAggregator } from "@dataspecer/core-v2/semantic-model/aggregator";
import { SemanticModelRelationship, SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { createRdfsModel, createSgovModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ModelGraphContext, useModelGraphContext } from "./context/graph-context";
import Header from "./header";
import { colorForModel } from "./util/utils";
import { Visualization } from "./visualization";
import { ClassesContext, type SemanticModelClassWithOrigin } from "./context/classes-context";
import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import { VisualizationContext } from "./context/visualization-context";
import { useBackendConnection } from "./backend-connection";
import { DCTERMS_MODEL_ID, LOCAL_MODEL_ID, SGOV_MODEL_ID } from "./util/constants";
import { usePackageSearch } from "./util/package-search";
import { ViewContext, ViewLayout } from "./context/view-context";
import { EntityCatalogue } from "./catalogue/entity-catalogue";
import { Position } from "./visualization/position";

const ModelsComponent = () => {
    const { aggregator, setAggregatorView, addModelToGraph, models, cleanModels, removeModelFromModels } =
        useModelGraphContext();
    const { packageId } = usePackageSearch();
    const { getModelsFromBackend } = useBackendConnection();

    useEffect(() => {
        console.log("getModelsFromBackend is going to be called from useEffect in ModelsComponent");
        if (!packageId) return;
        const getModels = () => getModelsFromBackend(packageId);
        getModels().then((models) => addModelToGraph(...models));
        return cleanModels;
    }, [packageId]);

    const handleAddModel = async (modelType: string) => {
        console.log("handle add model called");

        if (modelType === SGOV_MODEL_ID) {
            const model = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);
            model.allowClass("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
            addModelToGraph(model);
        } else if (modelType === DCTERMS_MODEL_ID) {
            const model = await createRdfsModel(
                ["https://mff-uk.github.io/demo-vocabularies/original/dublin_core_terms.ttl"],
                httpFetch
            );
            model.fetchFromPimStore();
            addModelToGraph(model);
        } else if (modelType === LOCAL_MODEL_ID) {
            const model = new InMemorySemanticModel();
            addModelToGraph(model);
        } else {
            alert(`unsupported model type ${modelType}`);
            return;
        }

        const aggregatedView = aggregator.getView();
        setAggregatorView(aggregatedView);

        console.log("in add model", models);
    };

    const AddModelButton = (props: { disabled: boolean; modelType: string }) => (
        <button
            onClick={() => handleAddModel(props.modelType)}
            disabled={props.disabled}
            type="button"
            className="cursor-pointer border bg-indigo-600 text-white disabled:cursor-default disabled:bg-zinc-500"
        >
            + <span className=" font-mono">{props.modelType}</span>
        </button>
    );

    const ModelItem = (props: { modelId: string }) => (
        <div className={`m-2 flex flex-row justify-between ${colorForModel.get(props.modelId)}`}>
            <h4 onClick={() => console.log(models.get(props.modelId))}>Model - {props.modelId}</h4>
            <button className="my-auto" onClick={() => removeModelFromModels(props.modelId)}>
                🗑️
            </button>
        </div>
    );

    return (
        <div className="overflow-y-scroll bg-teal-100">
            <h3 className=" font-semibold">Add Model Section</h3>
            <ul>
                {[...models.keys()].map((modelId, index) => (
                    <li key={"model" + index}>
                        <ModelItem modelId={modelId} />
                    </li>
                ))}
            </ul>
            <AddModelButton disabled={models.has(SGOV_MODEL_ID)} modelType={SGOV_MODEL_ID} />
            <AddModelButton disabled={models.has(DCTERMS_MODEL_ID)} modelType={DCTERMS_MODEL_ID} />
            <AddModelButton disabled={models.has(LOCAL_MODEL_ID)} modelType={LOCAL_MODEL_ID} />
        </div>
    );
};

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
    const [generalizations, setGeneralizations] = useState<SemanticModelGeneralization[]>([]);
    const [hideOwlThing, setHideOwlThing] = useState(false);
    const [classPositionMap, setClassPositionMap] = useState(new Map<string, Position>());
    const [activeViewId, setActiveViewId] = useState("");
    const [viewLayouts, setViewLayouts] = useState([] as ViewLayout[]);

    return (
        <>
            <ModelGraphContext.Provider
                value={{
                    aggregator,
                    aggregatorView,
                    setAggregatorView,
                    models,
                    setModels,
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
                                        <ModelsComponent />
                                        <EntityCatalogue />
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
