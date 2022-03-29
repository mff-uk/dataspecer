import {FederatedObservableStore, Subscriber} from "./federated-observable-store";
import {ReadOnlyMemoryStore} from "@model-driven-data/core/core";
import {PimSchema} from "@model-driven-data/core/pim/model";
import * as PIM from "@model-driven-data/core/pim/pim-vocabulary";


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

    test("a", async () => {
        const subscriber: Subscriber = (iri, resource) =>
            console.log("****", iri, resource);

        store.addSubscriber("http://resource/1", subscriber);
        store.addStore(coreReader);

        await new Promise(process.nextTick);
    });
});
