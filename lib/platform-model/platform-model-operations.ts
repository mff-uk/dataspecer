import {Store} from "./platform-model-store";

export interface Operation<Parameters> {
    /**
     * Checks if the operation with given parameters may be executed under the given store.
     * @param store Store with PIM and PSM elements
     * @param parameters Parameters for the operation
     * @return Whether the operation is valid
     */
    canExecute(store: Store, parameters: Parameters): boolean;

    /**
     * Executes the operation under the given parameters and returns a modified store.
     * @param store Store with PIM and PSM elements
     * @param parameters Parameters for the operation
     * @return {Store} New modified store
     */
    execute(store: Store, parameters: Parameters): Store;
}
