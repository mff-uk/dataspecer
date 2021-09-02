import {MultipleOperationExecutor, StoreContainer} from "../ModelObserverContainer";
import {DataPsmClass} from "model-driven-data/data-psm/model";
import {CoreResourceReader, createCoreResource} from "model-driven-data/core";
import {isPimAssociation, isPimAttribute, PimAssociation, PimAttribute, PimClass} from "model-driven-data/pim/model";
import {asPimCreateAssociation, asPimCreateAttribute, asPimCreateClass} from "model-driven-data/pim/operation";
import {
    asDataPsmCreateAssociationEnd,
    asDataPsmCreateAttribute,
    asDataPsmCreateClass
} from "model-driven-data/data-psm/operation";

export interface CompositeAddClassSurroundings {
    forDataPsmClass: DataPsmClass,
    sourcePimModel: CoreResourceReader,
    resourcesToAdd: string[],
}

export async function executeCompositeAddClassSurroundings(
    context: StoreContainer,
    operation: CompositeAddClassSurroundings,
): Promise<void> {
    const executor = new MultipleOperationExecutor();

    for (const resourceIri of operation.resourcesToAdd) {
        const resource = await operation.sourcePimModel.readResource(resourceIri);
        if (isPimAttribute(resource)) {
            await processAttribute(context, operation, resource, executor);
        }
        if (isPimAssociation(resource)) {
            await processAssociation(context, operation, resource, executor);
        }
    }

    executor.commit();
}

async function processAttribute(
    context: StoreContainer,
    operation: CompositeAddClassSurroundings,
    attribute: PimAttribute,
    executor: MultipleOperationExecutor,
): Promise<void> {

    // PIM attribute

    const pimCreateAttribute = asPimCreateAttribute({...attribute, types: [], iri: null});
    pimCreateAttribute.pimOwnerClass = operation.forDataPsmClass.dataPsmInterpretation;
    const pimCreateAttributeResult = await executor.applyOperation(context.pim, pimCreateAttribute);

    // PSM attribute

    const dataPsmCreateAttribute = asDataPsmCreateAttribute(createCoreResource());
    dataPsmCreateAttribute.dataPsmInterpretation = pimCreateAttributeResult.created[0];
    dataPsmCreateAttribute.dataPsmOwner = operation.forDataPsmClass.iri ?? undefined;
    await executor.applyOperation(context.dataPsm, dataPsmCreateAttribute);
}

async function processAssociation(
    context: StoreContainer,
    operation: CompositeAddClassSurroundings,
    association: PimAssociation,
    executor: MultipleOperationExecutor,
): Promise<void> {

    const interpretedPimClass = await context.pim.model.readResource(operation.forDataPsmClass.dataPsmInterpretation as string) as PimClass;

    const dom = await operation.sourcePimModel.readResource(association.pimEnd[0]) as PimClass;
    const rng = await operation.sourcePimModel.readResource(association.pimEnd[1]) as PimClass;

    const otherAssociationEnd = dom.pimInterpretation === interpretedPimClass.pimInterpretation ? rng : dom;

    // PIM the other class

    const pimCreateClass = asPimCreateClass({...otherAssociationEnd, types: [], iri: null});
    const pimCreateClassResult = await executor.applyOperation(context.pim, pimCreateClass);
    const pimOtherClassIri = pimCreateClassResult.created[0] as string;

    // PIM association

    const pimCreateAssociation = asPimCreateAssociation({...association, types: [], iri: null});
    pimCreateAssociation.pimAssociationEnds = (dom.pimInterpretation === interpretedPimClass.pimInterpretation) ? [operation.forDataPsmClass.dataPsmInterpretation as string, pimOtherClassIri] : [pimOtherClassIri, operation.forDataPsmClass.dataPsmInterpretation as string];
    const pimCreateAssociationResult = await executor.applyOperation(context.pim, pimCreateAssociation);

    // PSM the other class

    const dataPsmCreateClass = asDataPsmCreateClass(createCoreResource());
    dataPsmCreateClass.dataPsmInterpretation = pimOtherClassIri;
    const dataPsmCreateClassResult = await executor.applyOperation(context.dataPsm, dataPsmCreateClass);

    // PSM association

    const dataPsmCreateAssociationEnd = asDataPsmCreateAssociationEnd(createCoreResource());
    dataPsmCreateAssociationEnd.dataPsmInterpretation = pimCreateAssociationResult.created[0] as string;
    dataPsmCreateAssociationEnd.dataPsmPart = dataPsmCreateClassResult.created[0];
    dataPsmCreateAssociationEnd.dataPsmOwner = operation.forDataPsmClass.iri ?? undefined;
    await executor.applyOperation(context.dataPsm, dataPsmCreateAssociationEnd);

}

