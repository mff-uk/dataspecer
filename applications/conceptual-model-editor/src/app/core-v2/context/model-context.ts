import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { LanguageString } from "@dataspecer/core/core";
import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createClass, modifyClass, modifyRelation } from "@dataspecer/core-v2/semantic-model/operations";
import React, { useContext } from "react";
import {
    SemanticModelClass,
    SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntityModel, VisualEntityModelImpl } from "@dataspecer/core-v2/visual-model";
import { randomColorFromPalette } from "~/app/utils/color-utils";
import {
    createClassUsage,
    createRelationshipUsage,
    modifyClassUsage,
    modifyRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/operations";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

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
        return result;
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

    const modifyRelationship = (
        model: InMemorySemanticModel,
        entityId: string,
        newEntity: Partial<Omit<SemanticModelRelationship, "type" | "id">>
    ) => {
        console.log("modifying relationship ", newEntity);
        return model.executeOperation(modifyRelation(entityId, newEntity)).success;
    };

    const createClassEntityUsage = (
        model: InMemorySemanticModel,
        entityType: "class" | "class-usage",
        entity: Partial<Omit<SemanticModelClassUsage, "type">> & Pick<SemanticModelClassUsage, "usageOf">
    ) => {
        if (entityType == "class" || entityType == "class-usage") {
            const result = model.executeOperation(createClassUsage(entity));
            console.log(result);
            return result;
        } else {
            console.error(model, entityType, entity);
            throw new Error(`unexpected entityType ${entityType}`);
        }
    };

    const createRelationshipEntityUsage = (
        model: InMemorySemanticModel,
        entityType: "relationship" | "relationship-usage",
        entity: Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">
    ) => {
        if (entityType == "relationship" || entityType == "relationship-usage") {
            const result = model.executeOperation(createRelationshipUsage(entity));
            console.log(result);
            return result.success;
        } else {
            console.error(model, entityType, entity);
            throw new Error(`unexpected entityType ${entityType}`);
        }
        return false;
    };

    const updateEntityUsage = (
        model: InMemorySemanticModel,
        entityType: "class" | "relationship" | "class-usage" | "relationship-usage",
        id: string,
        entity: Partial<Omit<SemanticModelRelationshipUsage, "usageOf" | "type">>
    ) => {
        if (entityType == "relationship-usage") {
            console.log("about to modify relationship usage", id, entity);
            const result = model.executeOperation(modifyRelationshipUsage(id, entity));
            return result.success;
        } else if (entityType == "class-usage") {
            const result = model.executeOperation(modifyClassUsage(id, entity));
            return result.success;
        }
    };

    const updateClassUsage = (
        model: InMemorySemanticModel,
        entityType: "class-usage",
        id: string,
        entity: Partial<Omit<SemanticModelClassUsage, "usageOf" | "type">>
    ) => {
        if (entityType == "class-usage") {
            const result = model.executeOperation(modifyClassUsage(id, entity));
            return result.success;
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
        modifyRelationship,
        createClassEntityUsage,
        createRelationshipEntityUsage,
        updateEntityUsage,
        updateClassUsage,
        cleanModels,
        removeModelFromModels,
        visualModels,
        addVisualModelToGraph,
        setVisualModels,
        setModelAlias,
    };
};
