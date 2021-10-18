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

/**
 * With each association, the direction of the association must be specified. Suppose we have class Person representing
 * human beings. We also have class Barber, which clearly is a Person. Between Person and Barber, there is an
 * association that Person has a Barber. Because Barber can also have a Barber, the orientation of the association need
 * to be specified, whether we want to join Barber's Barber, or all Barbers going to the Barber.
 *
 * @todo Associations and attributes that belongs to inherited class (not the source class itself) are linked to the
 *     source class. Therefore all the inheritance is flattened.
 */
export class AddClassSurroundings implements ComplexOperation {
    private readonly forDataPsmClass: DataPsmClass;
    private readonly sourcePimModel: CoreResourceReader;
    private readonly resourcesToAdd: [string, boolean][];

    /**
     * @param forDataPsmClass
     * @param sourcePimModel
     * @param resourcesToAdd true - the edge is outgoing (from source to this resource)
     */
    constructor(forDataPsmClass: DataPsmClass, sourcePimModel: CoreResourceReader, resourcesToAdd: [string, boolean][]) {
        this.forDataPsmClass = forDataPsmClass;
        this.sourcePimModel = sourcePimModel;
        this.resourcesToAdd = resourcesToAdd;
    }

    async execute(executor: OperationExecutor): Promise<void> {
        const pimStoreSelector = new StoreHavingResourceDescriptor(this.forDataPsmClass.dataPsmInterpretation as string);
        const dataPsmStoreSelector = new StoreHavingResourceDescriptor(this.forDataPsmClass.iri as string);
        const interpretedPimClass = await executor.store.readResource(this.forDataPsmClass.dataPsmInterpretation as string) as PimClass;

        for (const [resourceIri, orientation] of this.resourcesToAdd) {
            const resource = await this.sourcePimModel.readResource(resourceIri);
            if (PimAttribute.is(resource)) {
                console.assert(orientation, `Attribute ${resourceIri} should not have a reverse orientation.`);
                await this.processAttribute(resource, executor, pimStoreSelector, dataPsmStoreSelector);
            }
            if (PimAssociation.is(resource)) {
                await this.processAssociation(resource, orientation, executor, pimStoreSelector, dataPsmStoreSelector, interpretedPimClass);
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
        orientation: boolean, // true if outgoing
        executor: OperationExecutor,
        pimStoreSelector: StoreDescriptor,
        dataPsmStoreSelector: StoreDescriptor,
        interpretedPimClass: PimClass, // "parent" PIM class
    ) {
        const dom = await this.sourcePimModel.readResource(association.pimEnd[0]) as PimClass;
        const rng = await this.sourcePimModel.readResource(association.pimEnd[1]) as PimClass;

        const otherAssociationEndClass = orientation ? rng : dom;

        // PIM the other class

        const pimCreateClass = new PimCreateClass();
        copyPimPropertiesFromResourceToOperation(otherAssociationEndClass, pimCreateClass);
        const pimCreateClassResult = await executor.applyOperation(pimCreateClass, pimStoreSelector);
        const pimOtherClassIri = pimCreateClassResult.created[0] as string;

        // PIM association

        const pimCreateAssociation = new PimCreateAssociation();
        copyPimPropertiesFromResourceToOperation(association, pimCreateAssociation);
        pimCreateAssociation.pimAssociationEnds = orientation ? [this.forDataPsmClass.dataPsmInterpretation as string, pimOtherClassIri] : [pimOtherClassIri, this.forDataPsmClass.dataPsmInterpretation as string];
        const pimCreateAssociationResult = await executor.applyOperation(pimCreateAssociation, pimStoreSelector);

        // Data PSM the other class

        const dataPsmCreateClass = new DataPsmCreateClass();
        dataPsmCreateClass.dataPsmInterpretation = pimOtherClassIri;
        const dataPsmCreateClassResult = await executor.applyOperation(dataPsmCreateClass, dataPsmStoreSelector);

        // Data PSM association end

        const dataPsmCreateAssociationEnd = new DataPsmCreateAssociationEnd();
        dataPsmCreateAssociationEnd.dataPsmInterpretation = pimCreateAssociationResult.created[orientation ? 2 : 1] as string; // todo use PimCreateAssociationResultProperties
        dataPsmCreateAssociationEnd.dataPsmPart = dataPsmCreateClassResult.created[0];
        dataPsmCreateAssociationEnd.dataPsmOwner = this.forDataPsmClass.iri ?? null;
        await executor.applyOperation(dataPsmCreateAssociationEnd, dataPsmStoreSelector);
    }
}
