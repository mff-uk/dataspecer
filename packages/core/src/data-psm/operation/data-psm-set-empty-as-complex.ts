import { CoreResource, CoreOperation } from "../../core/index.ts";
import * as PSM from "../data-psm-vocabulary.ts";

export class DataPsmSetEmptyAsComplex extends CoreOperation {
  static readonly TYPE = PSM.SET_EMPTY_AS_COMPLEX;

  dataPsmClass: string | null = null;

  dataPsmEmptyAsComplex: boolean | null = null;

  constructor() {
    super();
    this.types.push(DataPsmSetEmptyAsComplex.TYPE);
  }

  static is(
    resource: CoreResource | null
  ): resource is DataPsmSetEmptyAsComplex {
    return resource?.types.includes(DataPsmSetEmptyAsComplex.TYPE);
  }
}