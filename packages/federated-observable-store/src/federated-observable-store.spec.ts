import {FederatedObservableStore, Subscriber} from "./federated-observable-store";
import {ReadOnlyMemoryStore} from "@dataspecer/core/core";
import * as PSM from "@dataspecer/core/data-psm/data-psm-vocabulary";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { DataPsmClass } from "@dataspecer/core/data-psm/model/data-psm-class";

describe("FederatedObservableStore reading", () => {
    let store: FederatedObservableStore = null;
    let coreReader = ReadOnlyMemoryStore.create({
        "http://schema": {
            iri: "http://schema",
            types: [PSM.SCHEMA],
            dataPsmParts: ["http://resource/1"],
        } as DataPsmSchema,

        "http://resource/1": {
            iri: "http://resource/1",
            types: [PSM.CLASS],
        } as DataPsmClass,
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
