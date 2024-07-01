import {
    SemanticModelAggregator,
    type SemanticModelAggregatorView,
} from "@dataspecer/core-v2/semantic-model/aggregator";
import type { EntityModel } from "@dataspecer/core-v2/entity-model";
import type { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import React, { useContext } from "react";
import { type VisualEntityModel, VisualEntityModelImpl } from "@dataspecer/core-v2/visual-model";
import { randomColorFromPalette } from "~/app/utils/color-utils";

const aggregatorInstance = new SemanticModelAggregator();

export type ModelGraphContextType = {
    aggregator: typeof aggregatorInstance; // to make it compile
    aggregatorView: SemanticModelAggregatorView;
    setAggregatorView: React.Dispatch<React.SetStateAction<SemanticModelAggregatorView>>;
    models: Map<string, EntityModel>;
    setModels: React.Dispatch<React.SetStateAction<Map<string, EntityModel>>>;
    visualModels: Map<string, VisualEntityModel>;
    setVisualModels: React.Dispatch<React.SetStateAction<Map<string, VisualEntityModel>>>;
};

export const ModelGraphContext = React.createContext(null as unknown as ModelGraphContextType);

/**
 * provides all models and visual models we work with
 * also provides model manipulating functions (eg add, remove, set alias, ..)
 */
export const useModelGraphContext = () => {
    const { aggregator, aggregatorView, setAggregatorView, models, setModels, visualModels, setVisualModels } =
        useContext(ModelGraphContext);

    const addModelToGraph = (...models: EntityModel[]) => {
        // make sure there is a view
        if (!aggregatorView.getActiveVisualModel()) {
            const defaultVisualModel = new VisualEntityModelImpl(undefined);
            addVisualModelToGraph(defaultVisualModel);
            aggregatorView.changeActiveVisualModel(defaultVisualModel.getId());
        }

        for (const model of models) {
            aggregator.addModel(model);
            setModels((previous) => previous.set(model.getId(), model));

            for (const [_, visualModel] of visualModels) {
                console.log("setting color for model", model.getId());
                visualModel.setColor(model.getId(), randomColorFromPalette());
            }
        }
    };

    const addVisualModelToGraph = (...visModels: VisualEntityModel[]) => {
        for (const visModel of visModels) {
            aggregator.addModel(visModel);
            setVisualModels((previous) => previous.set(visModel.getId(), visModel));
        }
    };

    const setModelAlias = (alias: string | null, model: EntityModel) => {
        model.setAlias(alias);
        setModels((prev) => {
            return new Map(prev.set(model.getId(), model));
        });
    };

    const setModelIri = (iri: string, model: InMemorySemanticModel) => {
        model.setBaseIri(iri);
        setModels((prev) => {
            return new Map(prev.set(model.getId(), model));
        });
    };

    const cleanModels = () => {
        for (const [_, m] of models) {
            aggregator.deleteModel(m);
        }
        for (const [_, m] of visualModels) {
            aggregator.deleteModel(m);
        }
        setModels(new Map());
        setVisualModels(new Map());
    };

    const replaceModels = (m: EntityModel[], vm: VisualEntityModel[]) => {
        for (const [_, m] of models) {
            aggregator.deleteModel(m);
        }
        for (const [_, m] of visualModels) {
            aggregator.deleteModel(m);
        }

        for (const model of vm) {
            aggregator.addModel(model);
        }
        for (const model of m) {
            aggregator.addModel(model);
        }

        setVisualModels(new Map(vm.map((m) => [m.getId(), m])));
        setModels(new Map(m.map((m) => [m.getId(), m])));
    };

    const removeModelFromModels = (modelId: string) => {
        const model = models.get(modelId);
        if (!model) {
            alert(`no model with id: ${modelId} found`);
            return;
        }
        aggregator.deleteModel(model);
        models.delete(modelId);
        setModels(new Map(models));
    };

    const removeVisualModelFromModels = (modelId: string) => {
        const visualModel = visualModels.get(modelId);
        if (!visualModel) {
            alert(`no model with id: ${modelId} found`);
            return;
        }
        aggregator.deleteModel(visualModel);
        visualModels.delete(modelId);
        setVisualModels(new Map(visualModels));
        setAggregatorView(aggregator.getView());
    };

    return {
        aggregator,
        aggregatorView,
        setAggregatorView,
        models,
        visualModels,
        setVisualModels,
        addModelToGraph,
        addVisualModelToGraph,
        cleanModels,
        replaceModels,
        removeModelFromModels,
        removeVisualModelFromModels,
        setModelAlias,
        setModelIri,
    };
};
