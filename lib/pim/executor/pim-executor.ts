import {CoreOperationExecutor} from "../../core";
import * as Operations from "../operation";
import {executesPimCreateAssociation} from "./pim-create-association-executor";
import {executePimCreateAttribute} from "./pim-create-attribute-executor";
import {executePimCreateClass} from "./pim-create-class-executor";
import {executePimCreateSchema} from "./pim-create-schema-executor";
import {executePimDeleteAssociation} from "./pim-delete-association-executor";
import {executePimDeleteAttribute} from "./pim-delete-attribute-executor";
import {executePimDeleteClass} from "./pim-delete-class-executor";
import {executePimSetDataType} from "./pim-set-datatype-executor";
import {executePimSetHumanLabel} from "./pim-set-human-label-executor";
import {
  executePimSetHumanDescription,
} from "./pim-set-human-description-executor";
import {executePimSetTechnicalLabel} from "./pim-set-technical-label-executor";

export const pimExecutors: CoreOperationExecutor<any>[] = [
  CoreOperationExecutor.create(
    Operations.PimCreateAssociation.is,
    executesPimCreateAssociation,
    Operations.PimCreateAssociation.TYPE),
  CoreOperationExecutor.create(
    Operations.PimCreateAttribute.is,
    executePimCreateAttribute,
    Operations.PimCreateAttribute.TYPE),
  CoreOperationExecutor.create(
    Operations.PimCreateClass.is,
    executePimCreateClass,
    Operations.PimCreateClass.TYPE),
  CoreOperationExecutor.create(
    Operations.PimCreateSchema.is,
    executePimCreateSchema,
    Operations.PimCreateSchema.TYPE),
  CoreOperationExecutor.create(
    Operations.PimDeleteAssociation.is,
    executePimDeleteAssociation,
    Operations.PimDeleteAssociation.TYPE),
  CoreOperationExecutor.create(
    Operations.PimDeleteAttribute.is,
    executePimDeleteAttribute,
    Operations.PimDeleteAttribute.TYPE),
  CoreOperationExecutor.create(
    Operations.PimDeleteClass.is,
    executePimDeleteClass,
    Operations.PimDeleteClass.TYPE),
  CoreOperationExecutor.create(
    Operations.PimSetDatatype.is,
    executePimSetDataType,
    Operations.PimSetDatatype.TYPE),
  CoreOperationExecutor.create(
    Operations.PimSetHumanLabel.is,
    executePimSetHumanLabel,
    Operations.PimSetHumanLabel.TYPE),
  CoreOperationExecutor.create(
    Operations.PimSetHumanDescription.is,
    executePimSetHumanDescription,
    Operations.PimSetHumanDescription.TYPE),
  CoreOperationExecutor.create(
    Operations.PimSetTechnicalLabel.is,
    executePimSetTechnicalLabel,
    Operations.PimSetTechnicalLabel.TYPE),
];
