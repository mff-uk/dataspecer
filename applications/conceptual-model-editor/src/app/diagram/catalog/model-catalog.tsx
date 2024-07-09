import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createSgovModel, createRdfsModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { useModelGraphContext } from "../context/model-context";
import { ModelItemRow } from "../components/catalog-rows/model-item-row";
import { useState } from "react";

import { AddModelDialog, type PredefinedModel } from "../dialog/add-model-dialog";

import { logger } from "../application/";

const PREDEFINED_MODELS: PredefinedModel[] = [{
    "identifier": "rdf",
    "label": "RDF",
}, {
    "identifier": "rdfs",
    "label": "RDFS",
}, {
    "identifier": "dcterms",
    "label": "Dublin Core Terms",
}, {
    "identifier": "foaf",
    "label": "FOAF",
}, {
    "identifier": "skos",
    "label": "SKOS",
}, {
    "identifier": "sgov",
    "label": "Czech Semantic Dictionary of terms",
    "alias": "SGOV",
}];

const PREDEFINED_MODELS_URL: Record<string, string> = {
    "rdf": "https://datagov-cz.github.io/cache-slovniku/rdf.ttl",
    "rdfs": "https://datagov-cz.github.io/cache-slovniku/rdfs.ttl",
    "dcterms": "https://datagov-cz.github.io/cache-slovniku/dublin_core_terms.ttl",
    "foaf": "https://datagov-cz.github.io/cache-slovniku/foaf.ttl",
    "skos": "https://datagov-cz.github.io/cache-slovniku/skos.rdf",
};

export const ModelCatalog = () => {
    const { aggregator, setAggregatorView, addModelToGraph, models } = useModelGraphContext();
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);

    const addModelFromUrl = (url: string, alias: string) => {
        void (async () => {
            const model = await createRdfsModel([url], httpFetch);
            model.fetchFromPimStore();
            addModelToGraph(model);
            model.alias = alias;
            const aggregatedView = aggregator.getView();
            setAggregatorView(aggregatedView);
        })();
    };

    const addSgov = () => {
        const model = createSgovModel("https://slovník.gov.cz/sparql", httpFetch);
        model.allowClass("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl").catch(console.error);
        model.allowClass("https://slovník.gov.cz/veřejný-sektor/pojem/fyzická-osoba").catch(console.error);
        addModelToGraph(model);
    };

    const addLocalModel = (alias: string) => {
        const model = new InMemorySemanticModel();
        model.setAlias(alias);
        addModelToGraph(model);
    };

    const onAddModelFromUrl = (url: string, alias: string) => {
        setAddDialogOpen(false);
        addModelFromUrl(url, alias);
    };

    const onAddPredefinedModel = (models: PredefinedModel[]) => {
        setAddDialogOpen(false);
        for (const model of models) {
            const url = PREDEFINED_MODELS_URL[model.identifier] ?? null;
            if (url !== null) {
                addModelFromUrl(url, model.alias ?? model.label);
            } else if (model.identifier === "sgov") {
                addSgov();
            } else {
                logger.error("Invalid predefined model.", {model});
            }
        }
    };

    const onAddLocalModel = (alias: string) => {
        setAddDialogOpen(false);
        addLocalModel(alias);
    };

    return (
        <>
            <div className="min-w-24 overflow-y-scroll bg-teal-100 px-1">
                <ul>
                    {[...models.keys()].map((modelId, index) => (
                        <li key={"model" + index.toString()}>
                            <ModelItemRow modelId={modelId} />
                        </li>
                    ))}
                </ul>
                <div className="flex flex-row [&>*]:mr-1">
                    <button
                        onClick={() => setAddDialogOpen(true)}
                        type="button"
                        className="cursor-pointer border bg-indigo-600 px-1 text-white disabled:cursor-default disabled:bg-zinc-500"
                    >
                        Add a model
                    </button>
                </div>
            </div>
            <AddModelDialog
                isOpen={isAddDialogOpen}
                predefinedModels={PREDEFINED_MODELS}
                onCancel={() => setAddDialogOpen(false)}
                onAddModelFromUrl={onAddModelFromUrl}
                onAddPredefinedModel={onAddPredefinedModel}
                onAddLocalModel={onAddLocalModel}
            />
        </>
    );
};
