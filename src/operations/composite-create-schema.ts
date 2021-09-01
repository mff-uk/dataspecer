import {ApplyOperationOnModelContainer, StoreContainer} from "../ModelObserverContainer";
import {createCoreResource} from "model-driven-data/core";
import {asPimCreateSchema} from "model-driven-data/pim/operation";
import {asDataPsmCreateSchema} from "model-driven-data/data-psm/operation";

export interface CompositeCreateSchema {
    pimBaseIri: string,
    dataPsmBaseIri: string,
}

export async function executeCompositeCreateSchema (
    context: StoreContainer,
    operation: CompositeCreateSchema,
): Promise<string> {
    const pimCreateSchema = asPimCreateSchema(createCoreResource());
    pimCreateSchema.pimBaseIri = operation.pimBaseIri;
    await ApplyOperationOnModelContainer(context.pim, pimCreateSchema);

    const dataPsmCreateSchema = asDataPsmCreateSchema(createCoreResource());
    dataPsmCreateSchema.dataPsmBaseIri = operation.dataPsmBaseIri;
    const result = await ApplyOperationOnModelContainer(context.dataPsm, dataPsmCreateSchema);

    return result.created[0];
}
