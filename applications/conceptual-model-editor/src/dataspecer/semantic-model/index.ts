import { SemanticModelAggregator } from "@dataspecer/core-v2/semantic-model/aggregator";

// This is to compile with TypeScript as we can not use
// the type directly for aggregator.
const _SemanticModelAggregatorInstance = new SemanticModelAggregator();

export type SemanticModelAggregatorType = typeof _SemanticModelAggregatorInstance;
