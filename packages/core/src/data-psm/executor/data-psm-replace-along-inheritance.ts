import {CoreExecutorResult, CoreResourceReader, CreateNewIdentifier,} from "../../core";
import {DataPsmReplaceAlongInheritance} from "../operation";
import {DataPsmExecutorResultFactory,} from "./data-psm-executor-utils";
import {DataPsmAssociationEnd, DataPsmClass} from "../model";

export async function executeDataPsmReplaceAlongInheritance(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmReplaceAlongInheritance
): Promise<CoreExecutorResult> {
  const originalResource = await reader.readResource(
    operation.dataPsmOriginalClass
  );
  if (originalResource === null) {
    return DataPsmExecutorResultFactory.missing(
      operation.dataPsmOriginalClass
    );
  }
  if (!DataPsmClass.is(originalResource)) {
    return DataPsmExecutorResultFactory.invalidType(
      originalResource,
      "data-psm-class"
    );
  }

  const replacingResource = await reader.readResource(
    operation.dataPsmReplacingClass
  );
  if (replacingResource === null) {
    return DataPsmExecutorResultFactory.missing(
      operation.dataPsmReplacingClass
    );
  }
  if (!DataPsmClass.is(replacingResource)) {
    return DataPsmExecutorResultFactory.invalidType(
      replacingResource,
      "data-psm-class"
    );
  }

  if (replacingResource.dataPsmParts.length > 0) {
    return CoreExecutorResult.createError(
      "Replacing resource must not have any parts"
    );
  }

  // todo is replacingResource a subtype or supertype of originalResource

  // todo are all parts valid under the new replacingResource

  // Owner association end
  const resources = await reader.listResources();
  let ownerAssociationEnd: DataPsmAssociationEnd | null = null;
  for (const resourceIri of resources) {
    const resource = await reader.readResource(resourceIri);
    if (DataPsmAssociationEnd.is(resource) && resource.dataPsmPart === originalResource.iri) {
      if (ownerAssociationEnd !== null) {
        return CoreExecutorResult.createError(
          "Multiple owner association ends found"
        );
      }
      ownerAssociationEnd = resource;
    }
  }
  if (ownerAssociationEnd === null) {
    return CoreExecutorResult.createError(
      "No owner association end found"
    );
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...originalResource,
        dataPsmParts: [],
      } as DataPsmClass,
      {
        ...replacingResource,
        dataPsmParts: originalResource.dataPsmParts,
      } as DataPsmClass,
      {
        ...ownerAssociationEnd,
        dataPsmPart: replacingResource.iri,
      } as DataPsmAssociationEnd,
    ]
  );
}
