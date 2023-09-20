import {Entity} from "../model/entities";
import {SemanticModel} from "../model";

/**
 * Object containing the result of the aggregation of an entity together with additional metadata, such as how the
 * aggregation was performed.
 */
interface AggregatedEntityWrapper {
    id: string;
    aggregatedEntity: Entity | null;
    isLoading: boolean;
}

/**
 * Aggregates multiple models (the model graph] describing the semantics (concepts and their relations) into one.
 *
 * For example, we may have two semantic models, each with its own patches, merged together. The result is the
 * aggregation of the two models with their patches.
 */
interface SemanticModelAggregator {
    /**
     * Adds model describing the semantics to the aggregator.
     * @todo for now, only accepts one model
     * @param model
     */
    addModel(model: SemanticModel): void;

    /**
     * Returns the specific view.
     * @todo option to choose the view
     */
    getView(): SemanticModelAggregatorView;
}

class SemanticModelAggregatorInternal implements SemanticModelAggregator {
    model: SemanticModel | null = null;

    addModel(model: SemanticModel) {
        if (this.model != null) {
            throw new Error('Not implemented yet.');
        }

        this.model = model;
    };

    getView(): SemanticModelAggregatorView {
        if (this.model == null) {
            throw new Error('Not implemented yet. First add model.');
        }

        return new SemanticModelAggregatorView(this);
    }
}

// Necessary for exposing class internals for another class

const semanticModelAggregatorInternal = SemanticModelAggregatorInternal as (new () => SemanticModelAggregator);
export {semanticModelAggregatorInternal as SemanticModelAggregator}

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
        return this.aggregator.model?.getEntities() ?? {};
    };

    /**
     * Subscribe to changes.
     * @param callback Function that will be called when the entities change with the updated entities
     * @returns Function that can be called to unsubscribe from changes
     */
    subscribeToChanges(callback: (updated: Record<string, AggregatedEntityWrapper>, removed: string[]) => void): () => void {
        return this.aggregator.model?.subscribeToChanges(callback) ?? (() => {});
    }
}