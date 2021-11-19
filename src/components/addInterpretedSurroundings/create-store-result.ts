import {StoreContextInterface} from "../StoreContextInterface";
import {CoreResourceReader, ReadOnlyFederatedStore} from "model-driven-data/core";
import {AssociationOrientation} from "../../operations/add-class-surroundings";
import {PimAssociation, PimClass} from "model-driven-data/pim/model";

/**
 * This function creates a single store that will be passed to {@link AddClassSurroundings} operation
 *
 * This is helper method for dialog for adding interpreted surroundings. Because of how CIM interface works, it takes
 * multiple stores containing some CIM resources. The purpose of this method is to load additional data for the result.
 */
export const createStoreResult = async (
    cim: StoreContextInterface["cim"],
    hierarchyStore: CoreResourceReader | null,
    surroundings: Record<string, CoreResourceReader | undefined>,
    resourcesToAdd: [string, AssociationOrientation][]
) => {
    const surroundingsStores = Object.values(surroundings).filter((s => s !== undefined) as (s: CoreResourceReader | undefined) => s is CoreResourceReader);
    const store = ReadOnlyFederatedStore.createLazy(surroundingsStores);
    const hierarchyStores: CoreResourceReader[] = [];

    // Because we need to know which associations points to "číselník" we need to load hierarchy for every range class of outgoing association
    for (const resourceToAdd of resourcesToAdd) {
        if (!resourceToAdd[1]) {
            continue;
        }
        const resource = await store.readResource(resourceToAdd[0]);
        if (!PimAssociation.is(resource)) {
            continue;
        }
        const rangeIri = resource.pimEnd[1];
        const range = await store.readResource(rangeIri) as PimClass | null;

        if (range) {
            hierarchyStores.push(await cim.cimAdapter.getFullHierarchy(range.pimInterpretation as string));
        }
    }

    return ReadOnlyFederatedStore.createLazy([...(hierarchyStore ? [hierarchyStore] : []), ...hierarchyStores, ...surroundingsStores]);
}
