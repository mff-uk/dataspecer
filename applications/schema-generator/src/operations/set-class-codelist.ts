import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";
import {PimSetClassCodelist} from "model-driven-data/pim/operation";

export class SetClassCodelist implements ComplexOperation {
    private readonly forPimClassIri: string;
    private readonly codelist: string[];
    private readonly isCodelist: boolean;

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

    async execute(executor: OperationExecutor): Promise<void> {
        const pimSetClassCodelist = new PimSetClassCodelist();
        pimSetClassCodelist.pimClass = this.forPimClassIri;
        pimSetClassCodelist.pimIsCodeList = this.isCodelist;
        pimSetClassCodelist.pimCodelistUrl = this.codelist;
        await executor.applyOperation(pimSetClassCodelist, new StoreHavingResourceDescriptor(this.forPimClassIri));
        console.log(pimSetClassCodelist);
    }
}
