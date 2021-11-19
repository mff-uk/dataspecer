import {CoreResource} from "model-driven-data/core";
import {StoreWithMetadata} from "./federated-observable-store";

/**
 * Wraps {@link CoreResource} from model-driven-data library in a way that application can work with this as a
 * placeholder in case the resource is still being loaded, the loading failed or the resource is being updated.
 *
 * Also, when loading, the last known value is stored in resource field so the app can render at least obsoleted value.
 * @immutable
 */
export interface Resource<ResourceType extends CoreResource = CoreResource> {
    /**
     * The model-driven-data {@link CoreResource} or null, if error or loading for the first time. If the resource is
     * being reloaded, the old value is still stored here.
     */
    resource: ResourceType | null;
    isLoading: boolean;
}

export interface ResourceInfo {
    store: StoreWithMetadata | null;
}
