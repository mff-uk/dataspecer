import {ComplexOperation} from "@model-driven-data/federated-observable-store/complex-operation";
import {PimSetClassCodelist} from "@model-driven-data/core/pim/operation";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";

export class SetClassCodelist implements ComplexOperation {
    private readonly forPimClassIri: string;
    private readonly codelist: string[];
    private readonly isCodelist: boolean;
    private store!: FederatedObservableStore;

    /**
     * @param forPimClassIri
     * @param isCodelist
     * @param codelist
     */
    constructor(forPimClassIri: string, isCodelist: boolean, codelist: string[]) {
        this.forPimClassIri = forPimClassIri;
        this.codelist = codelist;
        this.isCodelist = isCodelist;
    }

    setStore(store: FederatedObservableStore) {
        this.store = store;
    }

    async execute(): Promise<void> {
        const schema = this.store.getSchemaForResource(this.forPimClassIri) as string;

        const pimSetClassCodelist = new PimSetClassCodelist();
        pimSetClassCodelist.pimClass = this.forPimClassIri;
        pimSetClassCodelist.pimIsCodeList = this.isCodelist;
        pimSetClassCodelist.pimCodelistUrl = this.codelist;
        await this.store.applyOperation(schema, pimSetClassCodelist);
    }
}
