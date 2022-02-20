import { CoreOperationResult, CoreResource, CoreTyped } from "../../core";
import { PimCreate } from "./pim-create";
import * as PIM from "../pim-vocabulary";

export class PimCreateAssociation extends PimCreate {
  static readonly TYPE = PIM.CREATE_ASSOCIATION;

  pimAssociationEnds: string[] = [];

  pimIsOriented = false;

  constructor() {
    super();
    this.types.push(PimCreateAssociation.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimCreateAssociation {
    return resource?.types.includes(PimCreateAssociation.TYPE);
  }
}

export class PimCreateAssociationResult extends CoreOperationResult {
  static readonly TYPE = PIM.CREATE_ASSOCIATION_RESULT;

  createdPimAssociation: string;

  createdPimAssociationEnds: string[];

  constructor(
    createdPimAssociation: string,
    createdPimAssociationEnds: string[]
  ) {
    super();
    this.types.push(PimCreateAssociationResult.TYPE);
    this.createdPimAssociation = createdPimAssociation;
    this.createdPimAssociationEnds = createdPimAssociationEnds;
  }

  static is(
    resource: CoreTyped | null
  ): resource is PimCreateAssociationResult {
    return resource?.types.includes(PimCreateAssociationResult.TYPE);
  }
}
