import {CoreOperationExecutor} from "../../core";
import * as Operations from "../operation";
import {
  executeDataPsmCreateAssociationEnd,
} from "./data-psm-create-association-end-executor";
import {
  executeDataPsmCreateAttribute,
} from "./data-psm-create-attribute-executor";
import {
  executeDataPsmCreateClass,
} from "./data-psm-create-class-executor";
import {
  executeDataPsmCreateSchema,
} from "./data-psm-create-schema-executor";
import {
  executeDataPsmDeleteAssociationEnd,
} from "./data-psm-delete-association-end-executor";
import {
  executeDataPsmDeleteAttribute,
} from "./data-psm-delete-attribute-executor";
import {
  executeDataPsmDeleteClass,
} from "./data-psm-delete-class-executor";
import {
  executeDataPsmSetHumanDescription,
} from "./data-psm-set-human-description-executor";
import {
  executeDataPsmSetHumanLabel,
} from "./data-psm-set-human-label-executor";
import {
  executeDataPsmSetInterpretation,
} from "./data-psm-set-interpretation-executor";
import {
  executeDataPsmSetOrder,
} from "./data-psm-set-order-executor";
import {
  executeDataPsmSetTechnicalLabel,
} from "./data-psm-set-technical-label-executor";
import {
  executeDataPsmSetRoots,
} from "./data-psm-set-roots-executor";
import {
  executeDataPsmSetDatatype,
} from "./data-psm-set-datatype-executor";
import {
  executeDataPsmCreateClassReference
} from "./data-psm-create-class-reference-executor";
import {
  executeDataPsmDeleteClassReference
} from "./data-psm-delete-class-reference-executor";

export const dataPsmExecutors: CoreOperationExecutor<any>[] = [
  CoreOperationExecutor.create(
    Operations.DataPsmCreateAssociationEnd.is,
    executeDataPsmCreateAssociationEnd,
    Operations.DataPsmCreateAssociationEnd.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmCreateAttribute.is,
    executeDataPsmCreateAttribute,
    Operations.DataPsmCreateAttribute.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmCreateClass.is,
    executeDataPsmCreateClass,
    Operations.DataPsmCreateClass.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmCreateClassReference.is,
    executeDataPsmCreateClassReference,
    Operations.DataPsmCreateClassReference.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmCreateSchema.is,
    executeDataPsmCreateSchema,
    Operations.DataPsmCreateSchema.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmDeleteAssociationEnd.is,
    executeDataPsmDeleteAssociationEnd,
    Operations.DataPsmDeleteAssociationEnd.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmDeleteAttribute.is,
    executeDataPsmDeleteAttribute,
    Operations.DataPsmDeleteAttribute.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmDeleteClass.is,
    executeDataPsmDeleteClass,
    Operations.DataPsmDeleteClass.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmDeleteClassReference.is,
    executeDataPsmDeleteClassReference,
    Operations.DataPsmDeleteClassReference.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmSetDatatype.is,
    executeDataPsmSetDatatype,
    Operations.DataPsmSetDatatype.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmSetHumanDescription.is,
    executeDataPsmSetHumanDescription,
    Operations.DataPsmSetHumanDescription.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmSetHumanLabel.is,
    executeDataPsmSetHumanLabel,
    Operations.DataPsmSetHumanLabel.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmSetInterpretation.is,
    executeDataPsmSetInterpretation,
    Operations.DataPsmSetInterpretation.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmSetOrder.is,
    executeDataPsmSetOrder,
    Operations.DataPsmSetOrder.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmSetTechnicalLabel.is,
    executeDataPsmSetTechnicalLabel,
    Operations.DataPsmSetTechnicalLabel.TYPE),
  CoreOperationExecutor.create(
    Operations.DataPsmSetRoots.is,
    executeDataPsmSetRoots,
    Operations.DataPsmSetRoots.TYPE),
];
