import {CoreOperationExecutor} from "../executor";
import {CoreOperation} from "../operation";
import {assert} from "../utilities/assert";

export function createExecutorMap(executors: CoreOperationExecutor<CoreOperation>[]) {
  const executorForTypes: ExecutorMap = {};
  executors.forEach((executor) => {
    assert(
      executorForTypes[executor.type] === undefined,
      `Only one executor can be declared for given type '${executor.type}'`
    );
    executorForTypes[executor.type] = executor;
  });
  return executorForTypes;
}

export type ExecutorMap = { [type: string]: CoreOperationExecutor<CoreOperation> };
