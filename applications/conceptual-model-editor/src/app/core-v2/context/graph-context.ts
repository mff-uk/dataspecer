import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { LanguageString } from "@dataspecer/core/core";

import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createClass, modifyClass } from "@dataspecer/core-v2/semantic-model/operations";
import React, { useContext } from "react";
import { getOneNameFromLanguageString } from "../util/utils";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { PimStoreWrapper } from "@dataspecer/core-v2/semantic-model/v1-adapters";
import { DCTERMS_MODEL_ID, LOCAL_MODEL_ID, SGOV_MODEL_ID } from "../util/constants";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";

const bob = new SemanticModelAggregator();

export type ModelGraphContextType = {
    aggregator: typeof bob; // to make it compile
    aggregatorView: SemanticModelAggregatorView;
    setAggregatorView: React.Dispatch<React.SetStateAction<SemanticModelAggregatorView>>;
    models: Map<string, EntityModel>;
    setModels: React.Dispatch<React.SetStateAction<Map<string, EntityModel>>>;
};

export const ModelGraphContext = React.createContext(null as unknown as ModelGraphContextType);

const getIdOfEntityModel = (model: EntityModel) => {
    if (model instanceof ExternalSemanticModel) {
        return SGOV_MODEL_ID;
    } else if (model instanceof PimStoreWrapper) {
        return DCTERMS_MODEL_ID;
    } else if (model instanceof InMemorySemanticModel) {
        return LOCAL_MODEL_ID;
    } else return "unknown:xyz" as string;
};

export const useModelGraphContext = () => {
    const { aggregator, aggregatorView, setAggregatorView, models, setModels /*activeModel, setActiveModel*/ } =
        useContext(ModelGraphContext);

    const addModelToGraph = (...models: EntityModel[]) => {
        for (const model of models) {
            aggregator.addModel(model);
            setModels((previous) => previous.set(getIdOfEntityModel(model), model));
        }
    };

    // FIXME: zas to vymysli nejak lip
    const addClassToLocalGraph = (name: LanguageString, description: LanguageString | undefined) => {
        const localModel = models.get(LOCAL_MODEL_ID);
        if (!localModel || !(localModel instanceof InMemorySemanticModel)) {
            alert("local model not found, see avail models in console");
            console.log(models);
            return false;
        }

        const result = localModel.executeOperation(
            createClass({
                name: name,
                iri: "https://my-fake.iri.com/" + getOneNameFromLanguageString(name),
                description: description,
            })
        );
        return result.success;
    };

    const modifyClassInLocalModel = (classId: string, newClass: Partial<Omit<SemanticModelClass, "type" | "id">>) => {
        const localModel = models.get(LOCAL_MODEL_ID);
        if (!localModel || !(localModel instanceof InMemorySemanticModel)) {
            alert("local model not found, see avail models in console");
            console.log(models);
            return false;
        }
        const result = localModel.executeOperation(
            modifyClass(classId, {
                ...newClass,
            })
        );
        return result.success;
    };

    const cleanModels = () => setModels(new Map<string, EntityModel>());

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
        addClassToLocalGraph,
        modifyClassInLocalModel,
        cleanModels,
        removeModelFromModels,
    };
};
