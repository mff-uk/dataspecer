import {
  CoreExecutorResult,
  CoreOperation,
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
} from "../../core";
import * as Operations from "../operation";
import {
  executesDataPsmCreateAssociationEnd,
} from "./data-psm-create-association-end-executor";
import {
  executesDataPsmCreateAttribute,
} from "./data-psm-create-attribute-executor";
import {
  executesDataPsmCreateClass,
} from "./data-psm-create-class-executor";
import {
  executesDataPsmCreateSchema,
} from "./data-psm-create-schema-executor";
import {
  executesDataPsmDeleteAssociationEnd,
} from "./data-psm-delete-association-end-executor";
import {
  executesDataPsmDeleteAttribute,
} from "./data-psm-delete-attribute-executor";
import {
  executesDataPsmDeleteClass,
} from "./data-psm-delete-class-executor";
import {
  executeDataPsmUpdateResourceHumanDescription,
} from "./data-psm-update-resource-human-description-executor";
import {
  executeDataPsmUpdateResourceHumanLabel,
} from "./data-psm-update-resource-human-label-executor";
import {
  executeDataPsmUpdateResourceInterpretation,
} from "./data-psm-update-resource-interpretation-executor";
import {
  executeDataPsmUpdateResourceOrder,
} from "./data-psm-update-resource-order-executor";
import {
  executeDataPsmUpdateResourceTechnicalLabel,
} from "./data-psm-update-resource-technical-label-executor";
import {
  executeDataPsmUpdateSchemaRoots,
} from "./data-psm-update-schema-roots-executor";
import {
  executeDataPsmUpdateAttributeDatatype,
} from "./data-psm-update-attribute-datatype-executor";

export async function executeDataPsmOperation(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: CoreOperation,
): Promise<CoreExecutorResult> {
  if (operation.types.length !== 1) {
    return createErrorOperationResult("Invalid operation");
  }
  switch (operation.types[0]) {
    case Operations.DataPsmCreateAssociationEndType:
      return await executesDataPsmCreateAssociationEnd(
        createNewIdentifier, modelReader,
        Operations.asDataPsmCreateAssociationEnd(operation));
    case Operations.DataPsmCreateAttributeType:
      return await executesDataPsmCreateAttribute(
        createNewIdentifier, modelReader,
        Operations.asDataPsmCreateAttribute(operation));
    case Operations.DataPsmCreateClassType:
      return await executesDataPsmCreateClass(
        createNewIdentifier, modelReader,
        Operations.asDataPsmCreateClass(operation));
    case Operations.DataPsmCreateSchemaType:
      return await executesDataPsmCreateSchema(
        createNewIdentifier, modelReader,
        Operations.asDataPsmCreateSchema(operation));
    case Operations.DataPsmDeleteAssociationEndType:
      return await executesDataPsmDeleteAssociationEnd(
        createNewIdentifier, modelReader,
        Operations.asDataPsmDeleteAssociationEnd(operation));
    case Operations.DataPsmDeleteAttributeType:
      return await executesDataPsmDeleteAttribute(
        createNewIdentifier, modelReader,
        Operations.asDataPsmDeleteAttribute(operation));
    case Operations.DataPsmDeleteClassType:
      return await executesDataPsmDeleteClass(
        createNewIdentifier, modelReader,
        Operations.asDataPsmDeleteClass(operation));
    case Operations.DataPsmUpdateAttributeDatatypeType:
      return await executeDataPsmUpdateAttributeDatatype(
        createNewIdentifier, modelReader,
        Operations.asDataPsmUpdateAttributeDatatype(operation));
    case Operations.DataPsmUpdateResourceHumanDescriptionType:
      return await executeDataPsmUpdateResourceHumanDescription(
        createNewIdentifier, modelReader,
        Operations.asDataPsmUpdateResourceHumanDescription(operation));
    case Operations.DataPsmUpdateResourceHumanLabelType:
      return await executeDataPsmUpdateResourceHumanLabel(
        createNewIdentifier, modelReader,
        Operations.asDataPsmUpdateResourceHumanLabel(operation));
    case Operations.DataPsmUpdateResourceInterpretationType:
      return await executeDataPsmUpdateResourceInterpretation(
        createNewIdentifier, modelReader,
        Operations.asDataPsmUpdateResourceInterpretation(operation));
    case Operations.DataPsmUpdateResourceOrderType:
      return await executeDataPsmUpdateResourceOrder(
        createNewIdentifier, modelReader,
        Operations.asDataPsmUpdateResourceOrder(operation));
    case Operations.DataPsmUpdateResourceTechnicalLabelType:
      return await executeDataPsmUpdateResourceTechnicalLabel(
        createNewIdentifier, modelReader,
        Operations.asDataPsmUpdateResourceTechnicalLabel(operation));
    case Operations.DataPsmUpdateSchemaRootsType:
      return await executeDataPsmUpdateSchemaRoots(
        createNewIdentifier, modelReader,
        Operations.asDataPsmUpdateSchemaRoots(operation));
    default:
      return createErrorOperationResult("Unknown operation");
  }
}
