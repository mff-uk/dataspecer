import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { LanguageString } from "@dataspecer/core/core";
import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createClass, modifyClass } from "@dataspecer/core-v2/semantic-model/operations";
import React, { useContext } from "react";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntityModel, VisualEntityModelImpl } from "@dataspecer/core-v2/visual-model";
import { randomColorFromPalette } from "~/app/utils/color-utils";
import { createClassUsage, createRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

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
        // make sure there is a view
        if (!visualModels.size) {
            addVisualModelToGraph(new VisualEntityModelImpl(undefined));
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

    // FIXME: zas to vymysli nejak lip
    const addClassToModel = (
        model: InMemorySemanticModel,
        name: LanguageString,
        iri: string,
        description: LanguageString | undefined
    ) => {
        const result = model.executeOperation(
            createClass({
                name: name,
                iri: iri,
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

    const createEntityUsage = (
        model: InMemorySemanticModel,
        entityType: "class" | "relationship",
        entity: Partial<Omit<SemanticModelClassUsage, "type">> & Pick<SemanticModelClassUsage, "usageOf">
    ) => {
        if (entityType == "class") {
            const result = model.executeOperation(createClassUsage(entity));
            console.log(result);
        } else if (entityType == "relationship") {
            const result = model.executeOperation(createRelationshipUsage(entity));
            console.log(result);
        } else {
            console.error(model, entityType, entity);
            throw new Error(`unexpected entityType ${entityType}`);
        }
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
        createEntityUsage,
        cleanModels,
        removeModelFromModels,
        visualModels,
        addVisualModelToGraph,
        setVisualModels,
    };
};
