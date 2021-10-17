import {DataPsmClass} from "model-driven-data/data-psm/model";
import {CoreResourceReader} from "model-driven-data/core";
import {PimAssociation, PimAttribute, PimClass} from "model-driven-data/pim/model";
import {
    DataPsmCreateAssociationEnd,
    DataPsmCreateAttribute,
    DataPsmCreateClass
} from "model-driven-data/data-psm/operation";
import {PimCreateAssociation, PimCreateAttribute, PimCreateClass} from "model-driven-data/pim/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreDescriptor, StoreHavingResourceDescriptor} from "../store/operation-executor";
import {copyPimPropertiesFromResourceToOperation} from "./helper/copyPimPropertiesFromResourceToOperation";

export class AddClassSurroundings implements ComplexOperation {
    private readonly forDataPsmClass: DataPsmClass;
    private readonly sourcePimModel: CoreResourceReader;
    private readonly resourcesToAdd: string[];

    constructor(forDataPsmClass: DataPsmClass, sourcePimModel: CoreResourceReader, resourcesToAdd: string[]) {
        this.forDataPsmClass = forDataPsmClass;
        this.sourcePimModel = sourcePimModel;
        this.resourcesToAdd = resourcesToAdd;
    }

    async execute(executor: OperationExecutor): Promise<void> {
        const pimStoreSelector = new StoreHavingResourceDescriptor(this.forDataPsmClass.dataPsmInterpretation as string);
        const dataPsmStoreSelector = new StoreHavingResourceDescriptor(this.forDataPsmClass.iri as string);
        const interpretedPimClass = await executor.store.readResource(this.forDataPsmClass.dataPsmInterpretation as string) as PimClass;

        for (const resourceIri of this.resourcesToAdd) {
            const resource = await this.sourcePimModel.readResource(resourceIri);
            if (PimAttribute.is(resource)) {
                await this.processAttribute(resource, executor, pimStoreSelector, dataPsmStoreSelector);
            }
            if (PimAssociation.is(resource)) {
                await this.processAssociation(resource, executor, pimStoreSelector, dataPsmStoreSelector, interpretedPimClass);
            }
        }
    }

    private async processAttribute(
        attribute: PimAttribute,
        executor: OperationExecutor,
        pimStoreSelector: StoreDescriptor,
        dataPsmStoreSelector: StoreDescriptor,
    ) {
        const pimCreateAttribute = new PimCreateAttribute();
        copyPimPropertiesFromResourceToOperation(attribute, pimCreateAttribute);
        pimCreateAttribute.pimOwnerClass = this.forDataPsmClass.dataPsmInterpretation;
        const pimCreateAttributeResult = await executor.applyOperation(pimCreateAttribute, pimStoreSelector);

        // PSM attribute

        const dataPsmCreateAttribute = new DataPsmCreateAttribute();
        dataPsmCreateAttribute.dataPsmInterpretation = pimCreateAttributeResult.created[0];
        dataPsmCreateAttribute.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        await executor.applyOperation(dataPsmCreateAttribute, dataPsmStoreSelector);
    }

    private async processAssociation(
        association: PimAssociation,
        executor: OperationExecutor,
        pimStoreSelector: StoreDescriptor,
        dataPsmStoreSelector: StoreDescriptor,
        interpretedPimClass: PimClass,
    ) {
        const dom = await this.sourcePimModel.readResource(association.pimEnd[0]) as PimClass;
        const rng = await this.sourcePimModel.readResource(association.pimEnd[1]) as PimClass;

        const isRngNew = dom.pimInterpretation === interpretedPimClass.pimInterpretation;
        const otherAssociationEndClass = isRngNew ? rng : dom;

        // PIM the other class

        const pimCreateClass = new PimCreateClass();
        copyPimPropertiesFromResourceToOperation(otherAssociationEndClass, pimCreateClass);
        const pimCreateClassResult = await executor.applyOperation(pimCreateClass, pimStoreSelector);
        const pimOtherClassIri = pimCreateClassResult.created[0] as string;

        // PIM association

        const pimCreateAssociation = new PimCreateAssociation();
        copyPimPropertiesFromResourceToOperation(association, pimCreateAssociation);
        pimCreateAssociation.pimAssociationEnds = isRngNew ? [this.forDataPsmClass.dataPsmInterpretation as string, pimOtherClassIri] : [pimOtherClassIri, this.forDataPsmClass.dataPsmInterpretation as string];
        const pimCreateAssociationResult = await executor.applyOperation(pimCreateAssociation, pimStoreSelector);

        // Data PSM the other class

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = pimOtherClassIri;
        const dataPsmCreateClassResult = await executor.applyOperation(dataPsmCreateClass, dataPsmStoreSelector);

        // Data PSM association end

        const dataPsmCreateAssociationEnd = new DataPsmCreateAssociationEnd();
        dataPsmCreateAssociationEnd.dataPsmInterpretation = pimCreateAssociationResult.created[isRngNew ? 2 : 1] as string; // todo use PimCreateAssociationResultProperties
        dataPsmCreateAssociationEnd.dataPsmPart = dataPsmCreateClassResult.created[0];
        dataPsmCreateAssociationEnd.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        await executor.applyOperation(dataPsmCreateAssociationEnd, dataPsmStoreSelector);
    }
}
