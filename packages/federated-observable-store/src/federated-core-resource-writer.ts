/**
 * This is temporary interface until {@link CoreResourceWriter} is reimplemented
 * according to https://github.com/mff-uk/dataspecer/issues/151
 */
import {CoreOperation, CoreOperationResult} from "@dataspecer/core/core";

export interface FederatedCoreResourceWriter {
  applyOperation(schema: string, operation: CoreOperation): Promise<CoreOperationResult>;
}

