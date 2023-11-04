"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { SemanticModelAggregator } from "@dataspecer/core-v2/semantic-model/aggregator";
import {
    isSemanticModelClass,
    SemanticModelRelationship,
    type SemanticModelClass,
    isSemanticModelRelationship,
    SemanticModelGeneralization,
    isSemanticModelGeneralization,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { ExternalSemanticModel, createRdfsModel, createSgovModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { InMemorySemanticModel } from "node_modules/@dataspecer/core-v2/lib/semantic-model/in-memory/in-memory-semantic-model";
import { ModelGraphContext, useModelGraphContext } from "./graph-context";
import Header from "../components/header";
import { colorForModel, getNameOf } from "./utils";
import { Visualization } from "./visualization";
import { ClassesContext, type SemanticModelClassWithOrigin, useClassesContext } from "./classes-context";
import { EntityModel } from "node_modules/@dataspecer/core-v2/lib/entity-model";
import { VisualizationContext, useVisualizationContext } from "./visualization-context";
import { getRandomName } from "../utils/random-gen";
import { useEntityDetailDialog } from "./entity-detail-dialog";

const ModelsComponent = () => {
    const { aggregator, setAggregatorView, addModelToGraph, models } = useModelGraphContext();
    const [searchedTerm, setSearchedTerm] = useState("");

    const handleAddModel = async (modelType: string) => {
        console.log("handle add model called");

        if (modelType === "sgov") {
            const model = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);
            model.allowClass("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
            addModelToGraph(modelType, model);
        } else if (modelType === "dcterms") {
            const model = await createRdfsModel(
                ["https://mff-uk.github.io/demo-vocabularies/original/dublin_core_terms.ttl"],
                httpFetch
            );
            model.fetchFromPimStore();
            addModelToGraph(modelType, model);
        } else if (modelType === "local") {
            const model = new InMemorySemanticModel();
            addModelToGraph(modelType, model);
        } else {
            alert(`unsupported model type ${modelType}`);
            return;
        }

        const aggregatedView = aggregator.getView();
        setAggregatorView(aggregatedView);

        console.log("in add model", models);
    };

    const handleModelAllowClass = (e: React.FormEvent) => {
        e.preventDefault();
        alert("TODO: implement after change uc2");
        // if (aggregatorModel instanceof PimStoreWrapper) return;
        // console.log("model allow class called", e, aggregatorModel, searchedTerm);
        // aggregatorModel?.allowClass(searchedTerm).catch(() => null);
        // setSearchedTerm("");
    };

    const handleModelSearch = (e: React.FormEvent) => {
        e.preventDefault();
        alert("TODO: jak delat search podle slov, pr: číselník");
        // console.log("model search called", e, aggregatorModel, searchedTerm);
        // aggregatorModel?.search(searchedTerm).catch(() => null);
        // setSearchedTerm("");
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

    return (
        <div className="overflow-y-scroll bg-teal-100">
            <h3 className=" font-semibold">Add Model Section</h3>
            <ul>
                {[...models.keys()].map((modelId, index) => (
                    <li key={"model" + index}>
                        <div className={`m-2 ${colorForModel.get(modelId)}`}>
                            <h4>
                                Model #{index} - {modelId}
                            </h4>
                        </div>
                    </li>
                ))}
            </ul>
            <AddModelButton disabled={models.has("sgov")} modelType="sgov" />
            <AddModelButton disabled={models.has("dcterms")} modelType="dcterms" />
            <AddModelButton disabled={models.has("local")} modelType="local" />
        </div>
    );
};

const EntityCatalogue = () => {
    const { aggregatorView, models, addClassToLocalGraph } = useModelGraphContext();
    const { setClasses, classes, allowedClasses, setAllowedClasses, setRelationships, setGeneralizations } =
        useClassesContext();
    const [entityDetailSelected, setEntityDetailSelected] = useState(null as unknown as SemanticModelClass);
    const { hideOwlThing, setHideOwlThing } = useVisualizationContext();

    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();

    useEffect(() => {
        // TODO: jak zarucit, ze se mi zobrazi krabicky hned pri prvnim pridani veci do modelu, nejak to blbne
        const callToUnsubscribe = aggregatorView?.subscribeToChanges(() => {
            setClasses(
                [...models.keys()]
                    .map((modelId) =>
                        Object.values(models.get(modelId)!.getEntities())
                            .filter(isSemanticModelClass)
                            .map((c) => ({ cls: c, origin: modelId }))
                    )
                    .flat()
            );
            setRelationships(
                [...models.keys()]
                    .map((modelId) =>
                        Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelRelationship)
                    )
                    .flat()
            );
            setGeneralizations(
                [...models.keys()]
                    .map((modelId) =>
                        Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelGeneralization)
                    )
                    .flat()
            );
        });
        return callToUnsubscribe;
    }, [models, aggregatorView]);

    const toggleAllow = async (modelId: string, classId: string) => {
        console.log("in toggle allow", aggregatorView);
        const model = models.get(modelId);
        if (!(model instanceof ExternalSemanticModel)) return;

        if (allowedClasses.includes(classId)) {
            setAllowedClasses(allowedClasses.filter((allowed) => allowed !== classId));
            await model.releaseClassSurroundings(classId);
        } else {
            setAllowedClasses([...allowedClasses, classId]);
            await model.allowClassSurroundings(classId);
        }
    };

    const handleOpenDetail = (cls: SemanticModelClass) => {
        console.log("in handle open detail for semantic model class", cls);
        setEntityDetailSelected(cls);
        openEntityDetailDialog();
    };

    const handleAddConcept = () => {
        const resultSuccess = addClassToLocalGraph({ cs: getRandomName(5), en: getRandomName(5) }, undefined);
        if (!resultSuccess) {
            alert("FIXME: something went wrong, class not added to local model");
        }
    };

    // classes from model
    const getClassesFromModel = (modelId: string) => {
        const model = models.get(modelId);
        let clses: JSX.Element[];
        if (model instanceof ExternalSemanticModel) {
            clses = classes
                .filter((v) => v.origin == modelId)
                .map((v) => (
                    <ExpandableRow
                        cls={v}
                        key={v.cls.id}
                        toggleHandler={() => {
                            toggleAllow(modelId, v.cls.id);
                        }}
                    />
                ));
        } else if (model instanceof InMemorySemanticModel) {
            clses = [
                ...classes.filter((v) => v.origin == modelId).map((v) => <NonExpandableRow cls={v} key={v.cls.id} />),
                <div className="flex flex-row justify-between whitespace-nowrap">
                    Add a concept
                    <button className="ml-2 bg-teal-300 px-1" onClick={handleAddConcept}>
                        Add
                    </button>
                </div>,
            ];
        } else {
            clses = classes.filter((v) => v.origin == modelId).map((v) => <NonExpandableRow cls={v} key={v.cls.id} />);
        }
        return (
            <li
                key={modelId}
                onClick={() => console.log(modelId)}
                className={colorForModel.get(modelId) ?? "bg-fuchsia-800"}
            >
                <ul>{clses}</ul>
            </li>
        );
    };

    // components
    const ExpandableRow = (props: { cls: SemanticModelClassWithOrigin; toggleHandler: () => void }) => {
        const cls = props.cls.cls;
        return (
            <div className="flex flex-row justify-between whitespace-nowrap">
                <span onClick={props.toggleHandler}>
                    {allowedClasses.includes(cls.id) ? "✅ " : "❌ "}
                    {getNameOf(cls)}
                </span>
                <button className="ml-2 bg-teal-300 px-1" onClick={() => handleOpenDetail(cls)}>
                    Detail
                </button>
            </div>
        );
    };
    const NonExpandableRow = (props: { cls: SemanticModelClassWithOrigin }) => (
        <div className="flex flex-row justify-between whitespace-nowrap">
            {getNameOf(props.cls.cls)}
            <button className="ml-2 bg-teal-300 px-1" onClick={() => handleOpenDetail(props.cls.cls)}>
                Detail
            </button>
        </div>
    );

    return (
        <>
            <div className="grid h-full w-full grid-cols-1 grid-rows-[20%_80%]">
                <ModelsComponent />
                <div className="h-full overflow-y-scroll">
                    <div className="flex flex-row">
                        <h2>Classes:</h2>
                        <input
                            name="owl-thing-hidden"
                            type="radio"
                            onClick={() => setHideOwlThing((prev) => !prev)}
                            checked={hideOwlThing}
                        />

                        <label htmlFor="owl-thing-hidden"> hide owl:thing</label>
                    </div>

                    <ul>{[...models.keys()].map((modelId) => getClassesFromModel(modelId))}</ul>
                </div>
            </div>
            {/* {entityDetailDialogOpen && (
                <EntityDetailDialog
                    cls={entityDetailSelected}
                    open={entityDetailDialogOpen}
                    onClose={() => setEntityDetailDialogOpen(false)}
                />
            )} */}
            {isEntityDetailDialogOpen && <EntityDetailDialog cls={entityDetailSelected} />}
        </>
    );
};

const Page = () => {
    const { aggregator } = useMemo(() => {
        const aggregator = new SemanticModelAggregator();
        return { aggregator };
    }, []);
    const [aggregatorView, setAggregatorView] = useState(aggregator.getView());
    const [models, setModels] = useState(new Map<string, EntityModel>());
    const [classes, setClasses] = useState<SemanticModelClassWithOrigin[]>([]);
    const [allowedClasses, setAllowedClasses] = useState<string[]>([]);
    const [relationships, setRelationships] = useState<SemanticModelRelationship[]>([]);
    const [generalizations, setGeneralizations] = useState<SemanticModelGeneralization[]>([]);
    const [hideOwlThing, setHideOwlThing] = useState(false);

    return (
        <>
            <Header page="use case 001" />
            <main className="h-[calc(100%-48px)] w-full bg-teal-50">
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
                        <VisualizationContext.Provider value={{ hideOwlThing, setHideOwlThing }}>
                            {" "}
                            <div className="my-0 grid h-full grid-cols-[25%_75%] grid-rows-1">
                                <EntityCatalogue />
                                <Visualization />
                            </div>
                        </VisualizationContext.Provider>
                    </ClassesContext.Provider>
                </ModelGraphContext.Provider>
            </main>
        </>
    );
};

export default Page;
