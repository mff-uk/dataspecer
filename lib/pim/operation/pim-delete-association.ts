import {CoreOperation, CoreResource} from "../../core";

export class PimDeleteAssociation extends CoreOperation {

  static readonly TYPE ="pim-action-delete-association";

  pimAssociation: string | null = null;

  constructor() {
    super();
    this.types.push(PimDeleteAssociation.TYPE);
  }

  static is(resource: CoreResource | null): resource is PimDeleteAssociation {
    return resource?.types.includes(PimDeleteAssociation.TYPE);
  }

}
