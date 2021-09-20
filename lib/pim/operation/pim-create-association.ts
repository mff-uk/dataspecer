import {CoreOperationResult, CoreResource, CoreTyped} from "../../core";
import {PimCreate} from "./pim-create";

export class PimCreateAssociation extends PimCreate {

  static readonly TYPE = "pim-action-create-association";

  pimAssociationEnds: string[];

  constructor() {
    super();
    this.types.push(PimCreateAssociation.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimCreateAssociation {
    return resource?.types.includes(PimCreateAssociation.TYPE);
  }

}

export class PimCreateAssociationResult extends CoreOperationResult {

  private static readonly TYPE = "pim-action-create-association-result";

  createdPimAssociation: string;

  createdPimAssociationEnds: string[];

  constructor(
    createdPimAssociation: string,
    createdPimAssociationEnds: string[],
  ) {
    super();
    this.types.push(PimCreateAssociationResult.TYPE);
    this.createdPimAssociation = createdPimAssociation;
    this.createdPimAssociationEnds = createdPimAssociationEnds;
  }

  static is(
    resource: CoreTyped | null,
  ): resource is PimCreateAssociationResult {
    return resource?.types.includes(PimCreateAssociationResult.TYPE);
  }

}
