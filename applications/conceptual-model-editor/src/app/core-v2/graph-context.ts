import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { LanguageString } from "@dataspecer/core/core";

import { EntityModel } from "node_modules/@dataspecer/core-v2/lib/entity-model";
import { InMemorySemanticModel } from "node_modules/@dataspecer/core-v2/lib/semantic-model/in-memory/in-memory-semantic-model";
import { createClass } from "node_modules/@dataspecer/core-v2/lib/semantic-model/operations/operations";
import React, { useContext } from "react";
import { getNameOf, getOneNameFromLanguageString } from "./utils";

const bob = new SemanticModelAggregator();

export type ModelGraphContextType = {
    aggregator: typeof bob; // to make it compile
    aggregatorView: SemanticModelAggregatorView; // | null;
    setAggregatorView: React.Dispatch<React.SetStateAction<SemanticModelAggregatorView>>;
    models: Map<string, EntityModel>;
    setModels: React.Dispatch<
        React.SetStateAction<Map<string, EntityModel> /* ExternalSemanticModel[] | PimStoreWrapper[] */>
    >;
    // activeModel: EntityModel /*ExternalSemanticModel  | PimStoreWrapper */ | null;
    // setActiveModel: React.Dispatch<React.SetStateAction<EntityModel /*ExternalSemanticModel | PimStoreWrapper */>>;
};

export const ModelGraphContext = React.createContext(null as unknown as ModelGraphContextType);

export const useModelGraphContext = () => {
    const { aggregator, aggregatorView, setAggregatorView, models, setModels /*activeModel, setActiveModel*/ } =
        useContext(ModelGraphContext);

    const addModelToGraph = (id: string, model: EntityModel) => {
        aggregator.addModel(model);
        setModels((previous) => previous.set(id, model));
    };

    // FIXME: zas to vymysli nejak lip
    const addClassToLocalGraph = (name: LanguageString, description: LanguageString | undefined) => {
        const localModel = models.get("local");
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

    return {
        aggregator,
        models,
        addModelToGraph,
        aggregatorView,
        setAggregatorView,
        addClassToLocalGraph,
    };
};
