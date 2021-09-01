import {MultipleOperationExecutor, StoreContainer} from "../ModelObserverContainer";
import {asDataPsmDeleteAttribute} from "model-driven-data/data-psm/operation";
import {createCoreResource} from "model-driven-data/core";
import {DataPsmAttribute, DataPsmClass} from "model-driven-data/data-psm/model";
import {asPimDeleteAttribute} from "model-driven-data/pim/operation";
import {PimAttribute} from "model-driven-data/pim/model";

export interface CompositeDeleteAttribute {
  attribute: DataPsmAttribute,
  ownerClass: DataPsmClass,
}

export async function executeCompositeDeleteAttribute(
    context: StoreContainer,
    operation: CompositeDeleteAttribute,
): Promise<void> {
  const executor = new MultipleOperationExecutor();

  const dataPsmDeleteAttribute = asDataPsmDeleteAttribute(createCoreResource());
  dataPsmDeleteAttribute.dataPsmAttribute = operation.attribute.iri as string;
  dataPsmDeleteAttribute.dataPsmOwner = operation.ownerClass.iri as string;
  await executor.applyOperation(context.dataPsm, dataPsmDeleteAttribute)

  // todo: should the PIM be deleted automatically?
  if (operation.attribute.dataPsmInterpretation) {
    const pimAttribute = await context.pim.model.readResource(operation.attribute.dataPsmInterpretation) as PimAttribute;

    const pimDeleteAttribute = asPimDeleteAttribute(createCoreResource());
    pimDeleteAttribute.pimAttribute = pimAttribute.iri ?? undefined;
    pimDeleteAttribute.parent = pimAttribute.pimOwnerClass;
    await executor.applyOperation(context.pim, pimDeleteAttribute);
  }

  executor.commit();
}
