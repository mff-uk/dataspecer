"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ModelGraphContext, useModelGraphContext } from "./context/graph-context";
import Header from "./header";
import { colorForModel, getNameOf } from "./util/utils";
import { Visualization } from "./visualization";
import { ClassesContext, type SemanticModelClassWithOrigin, useClassesContext } from "./context/classes-context";
import { type EntityModel } from "@dataspecer/core-v2/entity-model";
import { VisualizationContext, useVisualizationContext } from "./context/visualization-context";
import { getRandomName } from "../utils/random-gen";
import { useEntityDetailDialog } from "./entity-detail-dialog";
import { useBackendConnection } from "./backend-connection";
import { useModifyEntityDialog } from "./modify-entity-dialog";
import { DCTERMS_MODEL_ID, LOCAL_MODEL_ID, SGOV_MODEL_ID } from "./util/constants";
import { usePackageSearch } from "./util/package-search";
import { XYPosition } from "reactflow";

const ModelsComponent = () => {
    const { aggregator, setAggregatorView, addModelToGraph, models, cleanModels } = useModelGraphContext();
    const [searchedTerm, setSearchedTerm] = useState("");
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

    return (
        <div className="overflow-y-scroll bg-teal-100">
            <h3 className=" font-semibold">Add Model Section</h3>
            <ul>
                {[...models.keys()].map((modelId, index) => (
                    <li key={"model" + index}>
                        <div className={`m-2 ${colorForModel.get(modelId)}`}>
                            <h4 onClick={() => console.log(models.get(modelId))}>
                                Model #{index} - {modelId}
                            </h4>
                        </div>
                    </li>
                ))}
            </ul>
            <AddModelButton disabled={models.has(SGOV_MODEL_ID)} modelType={SGOV_MODEL_ID} />
            <AddModelButton disabled={models.has(DCTERMS_MODEL_ID)} modelType={DCTERMS_MODEL_ID} />
            <AddModelButton disabled={models.has(LOCAL_MODEL_ID)} modelType={LOCAL_MODEL_ID} />
        </div>
    );
};

const EntityCatalogue = () => {
    const { aggregatorView, models, addClassToLocalGraph, modifyClassInLocalModel } = useModelGraphContext();
    const { setClasses, classes, allowedClasses, setAllowedClasses, setRelationships, setGeneralizations } =
        useClassesContext();
    const [entityDetailSelected, setEntityDetailSelected] = useState(null as unknown as SemanticModelClass);
    const { hideOwlThing, setHideOwlThing } = useVisualizationContext();

    const { isEntityDetailDialogOpen, EntityDetailDialog, openEntityDetailDialog } = useEntityDetailDialog();
    const { isModifyEntityDialogOpen, ModifyEntityDialog, openModifyEntityDialog } = useModifyEntityDialog();

    useEffect(() => {
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
                .map((modelId) => Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelRelationship))
                .flat()
        );
        setGeneralizations(
            [...models.keys()]
                .map((modelId) =>
                    Object.values(models.get(modelId)!.getEntities()).filter(isSemanticModelGeneralization)
                )
                .flat()
        );

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

    const handleOpenModification = (cls: SemanticModelClass) => {
        console.log("in handle open modification for semantic model class", cls);
        setEntityDetailSelected(cls);
        openModifyEntityDialog();
    };

    const handleModifyConcept = (cls: SemanticModelClass, entity: Partial<Omit<SemanticModelClass, "type" | "id">>) => {
        const resultSuccess = modifyClassInLocalModel(cls.id, entity); //{ cs: getRandomName(5), en: getRandomName(5) }, undefined);
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
                ...classes.filter((v) => v.origin == modelId).map((v) => <ModifiableRow cls={v} key={v.cls.id} />),
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
    const ModifiableRow = (props: { cls: SemanticModelClassWithOrigin }) => (
        <div className="flex flex-row justify-between whitespace-nowrap">
            {getNameOf(props.cls.cls)}
            <div>
                <button className="ml-2 bg-teal-300 px-1" onClick={() => handleOpenModification(props.cls.cls)}>
                    Modify
                </button>
                <button className="ml-0.5 bg-teal-300 px-1" onClick={() => handleOpenDetail(props.cls.cls)}>
                    Detail
                </button>
            </div>
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
            {isEntityDetailDialogOpen && <EntityDetailDialog cls={entityDetailSelected} />}
            {isModifyEntityDialogOpen && (
                <ModifyEntityDialog
                    cls={entityDetailSelected}
                    save={(entity: Partial<Omit<SemanticModelClass, "type" | "id">>) =>
                        handleModifyConcept(entityDetailSelected, entity)
                    }
                />
            )}
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
    const [classPositionMap, setClassPositionMap] = useState(new Map<string, XYPosition>());

    return (
        <>
            <Header />
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
                        <VisualizationContext.Provider
                            value={{ hideOwlThing, setHideOwlThing, classPositionMap, setClassPositionMap }}
                        >
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
