import {ApplyOperationOnModelContainer, StoreContainer} from "../ModelObserverContainer";
import {PimClass} from "model-driven-data/pim/model";
import {asPimCreateClass} from "model-driven-data/pim/operation";
import {asDataPsmCreateClass, asDataPsmUpdateSchemaRoots} from "model-driven-data/data-psm/operation";
import {createCoreResource} from "model-driven-data/core";

export interface compositeCreateRootClass {
    pimClass: PimClass,
}

export async function executeCompositeCreateRootClass(
    context: StoreContainer,
    operation: compositeCreateRootClass,
): Promise<void> {
    const pimCreateClass = asPimCreateClass({...operation.pimClass, types: [], iri: null});
    const pimCreateClassResult = await ApplyOperationOnModelContainer(context.pim, pimCreateClass);

    const dataPsmCreateClass = asDataPsmCreateClass(createCoreResource());
    dataPsmCreateClass.dataPsmInterpretation = pimCreateClassResult.created[0];
    const dataPsmCreateClassResult = await ApplyOperationOnModelContainer(context.dataPsm, dataPsmCreateClass);

    const dataPsmUpdateSchemaRoots = asDataPsmUpdateSchemaRoots(createCoreResource());
    dataPsmUpdateSchemaRoots.dataPsmRoots = [dataPsmCreateClassResult.created[0]];
    await ApplyOperationOnModelContainer(context.dataPsm, dataPsmUpdateSchemaRoots);
}
