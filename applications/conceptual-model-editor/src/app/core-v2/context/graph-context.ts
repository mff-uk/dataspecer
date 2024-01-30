import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { LanguageString } from "@dataspecer/core/core";

import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createClass, modifyClass } from "@dataspecer/core-v2/semantic-model/operations";
import React, { useContext } from "react";
import { getOneNameFromLanguageString } from "../util/utils";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { PimStoreWrapper } from "node_modules/@dataspecer/core-v2/lib/src/semantic-model/v1-adapters/pim-store-wrapper";
import { DCTERMS_MODEL_ID, LOCAL_MODEL_ID, SGOV_MODEL_ID } from "../util/constants";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntityModel } from "@dataspecer/core-v2/visual-model";

const bob = new SemanticModelAggregator();

export type ModelGraphContextType = {
    aggregator: typeof bob; // to make it compile
    aggregatorView: SemanticModelAggregatorView;
    setAggregatorView: React.Dispatch<React.SetStateAction<SemanticModelAggregatorView>>;
    models: Map<string, EntityModel>;
    setModels: React.Dispatch<React.SetStateAction<Map<string, EntityModel>>>;
    visualModels: Map<string, VisualEntityModel>;
    setVisualModels: React.Dispatch<React.SetStateAction<Map<string, VisualEntityModel>>>;
};

export const ModelGraphContext = React.createContext(null as unknown as ModelGraphContextType);

/** @todo models should have an Id*/
export const getIdOfEntityModel = (model: EntityModel) => {
    return model.getId();
};

export const useModelGraphContext = () => {
    const { aggregator, aggregatorView, setAggregatorView, models, setModels, visualModels, setVisualModels } =
        useContext(ModelGraphContext);

    const addModelToGraph = (...models: EntityModel[]) => {
        for (const model of models) {
            aggregator.addModel(model);
            setModels((previous) => previous.set(model.getId(), model));
        }
    };

    // FIXME: zas to vymysli nejak lip
    const addClassToModel = (
        model: InMemorySemanticModel,
        name: LanguageString,
        description: LanguageString | undefined
    ) => {
        const result = model.executeOperation(
            createClass({
                name: name,
                iri: "https://my-fake.iri.com/" + getOneNameFromLanguageString(name).t,
                description: description,
            })
        );
        return result.success;
    };

    const modifyClassInAModel = (
        model: InMemorySemanticModel,
        classId: string,
        newClass: Partial<Omit<SemanticModelClass, "type" | "id">>
    ) => {
        const result = model.executeOperation(
            modifyClass(classId, {
                ...newClass,
            })
        );
        return result.success;
    };

    const cleanModels = () => {
        setModels(new Map<string, EntityModel>());
        setVisualModels(new Map<string, VisualEntityModel>());
    };

    const removeModelFromModels = (modelId: string) => {
        const model = models.get(modelId);
        if (!model) {
            alert(`no model with id: ${modelId} found`);
            return;
        }
        aggregator.deleteModel(model);
        models.delete(getIdOfEntityModel(model));
        setModels(new Map(models));
    };

    return {
        aggregator,
        models,
        addModelToGraph,
        aggregatorView,
        setAggregatorView,
        addClassToModel,
        modifyClassInAModel,
        cleanModels,
        removeModelFromModels,
        visualModels,
        setVisualModels,
    };
};
