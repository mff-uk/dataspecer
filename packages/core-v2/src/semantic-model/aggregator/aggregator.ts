import { Entity } from "../../entity-model/entity";

import { EntityModel } from "../../entity-model/entity-model";
import { VisualEntity } from "../../visual-model/visual-entity";
import { VisualEntityModel, isVisualModel } from "../../visual-model/visual-model";

/**
 * Object containing the result of the aggregation of an entity together with additional metadata, such as how the
 * aggregation was performed.
 */
export interface AggregatedEntityWrapper {
    id: string;
    aggregatedEntity: Entity | null;
    visualEntity: VisualEntity | null;
}

type SupportedModels = EntityModel | VisualEntityModel;

type AggregatedModelSubscriber = (updated: AggregatedEntityWrapper[], removed: string[]) => void;

/**
 * Aggregates multiple models (the model graph] describing the semantics (concepts and their relations) into one.
 *
 * For example, we may have two semantic models, each with its own patches, merged together. The result is the
 * aggregation of the two models with their patches.
 */
interface SemanticModelAggregator {
    /**
     * Adds model describing the semantics to the aggregator.
     */
    addModel(model: SupportedModels): void;

    /**
     * Unregisters the model from the aggregator.
     */
    deleteModel(model: SupportedModels): void;

    /**
     * Returns the specific view.
     * @todo option to choose the view
     */
    getView(): SemanticModelAggregatorView;
}

class SemanticModelAggregatorInternal implements SemanticModelAggregator {
    models: Map<SupportedModels, () => void> = new Map();
    baseModelEntities: AggregatedEntityWrapper[] = [];
    baseModelSubscribers = new Set<AggregatedModelSubscriber>();

    activeVisualModel: VisualEntityModel | null = null;

    addModel(model: SupportedModels) {
        if (this.models.has(model)) {
            throw new Error("Model already added.");
        }

        if (isVisualModel(model)) {
            const unsubscribe = model.subscribeToChanges((updated, removed) => {
                console.log("visual-model", model.getId(), "updated&removed", updated, removed);
            });
            this.models.set(model, unsubscribe);
            // this.activeVisualModel = model;
            return;
        }

        const callback = (updated: Record<string, Entity>, removed: string[]) => {
            if (!this.models.has(model)) {
                return;
            }

            const entities = Object.values(updated);
            const wrappedEntities = entities.map((aggregatedEntity) => ({
                id: aggregatedEntity.id,
                aggregatedEntity,
                visualEntity: null,
            }));

            // Suppose there is a model that joins them all. Then we need to inform it
            this.notifyBaseModel(model, wrappedEntities, removed);
        };

        const unsubscribe = model.subscribeToChanges(callback);
        this.models.set(model, unsubscribe);
        callback(model.getEntities(), []);
    }

    deleteModel(model: SupportedModels) {
        const unsubscribe = this.models.get(model);
        if (!unsubscribe) {
            throw new Error("Model not added.");
        }

        this.models.delete(model);

        if (isVisualModel(model)) {
            if (this.activeVisualModel?.getId() == model.getId()) {
                this.setActiveVisualModel(
                    ([...this.models.keys()].find((m) => isVisualModel(m)) as VisualEntityModel) ?? null
                );
            }
            return;
        }

        this.notifyBaseModel(model, [], Object.keys(model.getEntities()));
        // TODO: shouldn't `unsubscribe()` be called?
    }

    /**
     * Temporary function that notifies base model about changes. We suppose that every model is a dependency of the base model.
     */
    private notifyBaseModel(fromModel: SupportedModels, updated: AggregatedEntityWrapper[], removed: string[]) {
        // This does only a simple merge
        this.baseModelEntities = this.baseModelEntities
            .filter(
                (entity) =>
                    !removed.includes(entity.id) && !updated.find((updatedEntity) => updatedEntity.id === entity.id)
            )
            .concat(updated);
        this.baseModelSubscribers.forEach((subscriber) => subscriber(updated, removed));
    }

    getView(): SemanticModelAggregatorView {
        return new SemanticModelAggregatorView(this);
    }

    setActiveVisualModel(toModel: string | VisualEntityModel | null) {
        if (typeof toModel == "string") {
            this.activeVisualModel = [...this.models.keys()].find(
                (m) => (m as VisualEntityModel)?.getId() == toModel
            ) as VisualEntityModel;
            return;
        }
        this.activeVisualModel = toModel; // can be null or a real visual model
    }
}

// Necessary for exposing class internals for another class

const semanticModelAggregatorInternal = SemanticModelAggregatorInternal as new () => SemanticModelAggregator;
export { semanticModelAggregatorInternal as SemanticModelAggregator };

/**
 * Provides methods for reading the aggregated semantic model graph. Usually, we want the aggregation of the whole
 * graph, but sometimes it may be useful to get aggregation of only a subgraph. For example, instead of getting the
 * semantics with patches applied, we may want to get only the original semantics without the patches. Therefore,
 * multiple views can be created for the same aggregator, each for a different subgraph.
 */
export class SemanticModelAggregatorView {
    private readonly aggregator: SemanticModelAggregatorInternal;

    /**
     * @internal use {@link SemanticModelAggregator.getView} instead
     */
    constructor(aggregator: SemanticModelAggregatorInternal) {
        this.aggregator = aggregator;
    }

    /**
     * Returns all entities aggregated.
     */
    getEntities(): Record<string, AggregatedEntityWrapper> {
        // todo temporary
        return Object.fromEntries(
            this.aggregator.baseModelEntities.map((e) => [
                e.id,
                {
                    id: e.id,
                    aggregatedEntity: e.aggregatedEntity,
                    visualEntity: this.aggregator.activeVisualModel?.getVisualEntity(e.id),
                } as AggregatedEntityWrapper,
            ])
        );
    }

    /**
     * Subscribe to changes.
     * @param callback Function that will be called when the entities change with the updated entities
     * @returns Function that can be called to unsubscribe from changes
     */
    subscribeToChanges(callback: AggregatedModelSubscriber): () => void {
        // todo temporary
        if (this.aggregator.baseModelSubscribers.has(callback)) {
            throw new Error("Callback already subscribed.");
        }
        this.aggregator.baseModelSubscribers.add(callback);
        return () => this.aggregator.baseModelSubscribers.delete(callback);
    }

    changeView(toModel: SupportedModels) {
        throw new Error("Not implemented yet.");
    }

    getActiveViewId() {
        return this.aggregator.activeVisualModel?.getId();
    }

    getActiveVisualModel() {
        return this.aggregator.activeVisualModel;
    }

    getAvailableVisualModelIds(): string[] {
        return [...this.aggregator.models.keys()]
            .filter((m) => isVisualModel(m))
            .map((m) => (m as VisualEntityModel).getId());
    }

    changeActiveVisualModel(toModel: string | null) {
        this.aggregator.setActiveVisualModel(toModel);
    }
}
