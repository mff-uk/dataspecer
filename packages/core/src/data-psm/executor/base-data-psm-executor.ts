import { CoreOperation, CoreOperationExecutor } from "../../core";
import * as Operations from "../operation";
import { executeDataPsmCreateAssociationEnd } from "./data-psm-create-association-end-executor";
import { executeDataPsmCreateAttribute } from "./data-psm-create-attribute-executor";
import { executeDataPsmCreateClass } from "./data-psm-create-class-executor";
import { executeDataPsmCreateSchema } from "./data-psm-create-schema-executor";
import { executeDataPsmDeleteAssociationEnd } from "./data-psm-delete-association-end-executor";
import { executeDataPsmDeleteAttribute } from "./data-psm-delete-attribute-executor";
import { executeDataPsmDeleteClass } from "./data-psm-delete-class-executor";
import { executeDataPsmSetHumanDescription } from "./data-psm-set-human-description-executor";
import { executeDataPsmSetHumanLabel } from "./data-psm-set-human-label-executor";
import { executeDataPsmSetInterpretation } from "./data-psm-set-interpretation-executor";
import { executeDataPsmSetOrder } from "./data-psm-set-order-executor";
import { executeDataPsmSetTechnicalLabel } from "./data-psm-set-technical-label-executor";
import { executeDataPsmSetRoots } from "./data-psm-set-roots-executor";
import { executeDataPsmSetDatatype } from "./data-psm-set-datatype-executor";
import { executeDataPsmCreateClassReference } from "./data-psm-create-class-reference-executor";
import { executeDataPsmDeleteClassReference } from "./data-psm-delete-class-reference-executor";
import { executeDataPsmSetPart } from "./data-psm-set-part-executor";
import { executeDataPsmSetDematerialize } from "./data-psm-set-dematerialize-executor";
import { executeDataPsmReplaceAlongInheritance } from "./data-psm-replace-along-inheritance";
import { executeDataPsmCreateInclude } from "./data-psm-create-include-executor";
import { executeDataPsmDeleteInclude } from "./data-psm-delete-include-executor";
import { executeDataPsmCreateOr } from "./data-psm-create-or-executor";
import { executeDataPsmDeleteOr } from "./data-psm-delete-or-executor";
import { executeDataPsmUnwrapOr } from "./data-psm-unwrap-or-executor";
import { executeDataPsmWrapWithOr } from "./data-psm-wrap-with-or-executor";
import {executeDataPsmSetChoice} from "./data-psm-set-choice-executor";
import {executeDataPsmUnsetChoice} from "./data-psm-unset-choice-executor";

export const baseDataPsmExecutors: CoreOperationExecutor<CoreOperation>[] = [
  CoreOperationExecutor.create(
    Operations.DataPsmCreateAssociationEnd.is,
    executeDataPsmCreateAssociationEnd,
    Operations.DataPsmCreateAssociationEnd.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmCreateAttribute.is,
    executeDataPsmCreateAttribute,
    Operations.DataPsmCreateAttribute.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmCreateClass.is,
    executeDataPsmCreateClass,
    Operations.DataPsmCreateClass.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmCreateClassReference.is,
    executeDataPsmCreateClassReference,
    Operations.DataPsmCreateClassReference.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmCreateInclude.is,
    executeDataPsmCreateInclude,
    Operations.DataPsmCreateInclude.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmCreateOr.is,
    executeDataPsmCreateOr,
    Operations.DataPsmCreateOr.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmCreateSchema.is,
    executeDataPsmCreateSchema,
    Operations.DataPsmCreateSchema.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmDeleteAssociationEnd.is,
    executeDataPsmDeleteAssociationEnd,
    Operations.DataPsmDeleteAssociationEnd.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmDeleteAttribute.is,
    executeDataPsmDeleteAttribute,
    Operations.DataPsmDeleteAttribute.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmDeleteClass.is,
    executeDataPsmDeleteClass,
    Operations.DataPsmDeleteClass.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmDeleteClassReference.is,
    executeDataPsmDeleteClassReference,
    Operations.DataPsmDeleteClassReference.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmDeleteInclude.is,
    executeDataPsmDeleteInclude,
    Operations.DataPsmDeleteInclude.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmDeleteOr.is,
    executeDataPsmDeleteOr,
    Operations.DataPsmDeleteOr.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmReplaceAlongInheritance.is,
    executeDataPsmReplaceAlongInheritance,
    Operations.DataPsmReplaceAlongInheritance.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetChoice.is,
    executeDataPsmSetChoice,
    Operations.DataPsmSetChoice.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetDatatype.is,
    executeDataPsmSetDatatype,
    Operations.DataPsmSetDatatype.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetHumanDescription.is,
    executeDataPsmSetHumanDescription,
    Operations.DataPsmSetHumanDescription.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetHumanLabel.is,
    executeDataPsmSetHumanLabel,
    Operations.DataPsmSetHumanLabel.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetInterpretation.is,
    executeDataPsmSetInterpretation,
    Operations.DataPsmSetInterpretation.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetOrder.is,
    executeDataPsmSetOrder,
    Operations.DataPsmSetOrder.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetPart.is,
    executeDataPsmSetPart,
    Operations.DataPsmSetPart.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetTechnicalLabel.is,
    executeDataPsmSetTechnicalLabel,
    Operations.DataPsmSetTechnicalLabel.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetRoots.is,
    executeDataPsmSetRoots,
    Operations.DataPsmSetRoots.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmSetDematerialized.is,
    executeDataPsmSetDematerialize,
    Operations.DataPsmSetDematerialized.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmUnsetChoice.is,
    executeDataPsmUnsetChoice,
    Operations.DataPsmUnsetChoice.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmUnwrapOr.is,
    executeDataPsmUnwrapOr,
    Operations.DataPsmUnwrapOr.TYPE
  ),
  CoreOperationExecutor.create(
    Operations.DataPsmWrapWithOr.is,
    executeDataPsmWrapWithOr,
    Operations.DataPsmWrapWithOr.TYPE
  ),
];
