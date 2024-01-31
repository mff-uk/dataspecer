import {FederatedObservableStore, Subscriber} from "./federated-observable-store";
import {ReadOnlyMemoryStore} from "@dataspecer/core/core";
import {PimSchema} from "@dataspecer/core/pim/model";
import * as PIM from "@dataspecer/core/pim/pim-vocabulary";

describe("FederatedObservableStore reading", () => {
    let store: FederatedObservableStore = null;
    let coreReader = ReadOnlyMemoryStore.create({
        "http://schema": {
            iri: "http://schema",
            types: [PIM.SCHEMA],
            pimParts: ["http://resource/1"],
        } as PimSchema,

        "http://resource/1": {
            iri: "http://resource/1",
            types: [PIM.CLASS],
        } as PimSchema,
    });

    beforeAll(() => {
        store = new FederatedObservableStore();
    });

    test("Test add store and subscriber", async () => {
        let wasSubscribed = false;

        const subscriber: Subscriber = (iri, resource) =>
            wasSubscribed = true;

        store.addSubscriber("http://resource/1", subscriber);
        store.addStore(coreReader);

        expect(wasSubscribed).toBe(true);

        await new Promise(process.nextTick);
    });
});
