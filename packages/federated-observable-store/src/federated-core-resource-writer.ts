/**
 * This is temporary interface until {@link CoreResourceWriter} is reimplemented
 * according to https://github.com/opendata-mvcr/model-driven-data/issues/151
 */
import {CoreOperation, CoreOperationResult} from "@model-driven-data/core/core";

export interface FederatedCoreResourceWriter {
  applyOperation(schema: string, operation: CoreOperation): Promise<CoreOperationResult>;
}

