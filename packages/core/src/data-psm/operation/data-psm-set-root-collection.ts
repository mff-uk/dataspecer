import { CoreOperation, CoreResource } from "../../core";
import * as PSM from "../data-psm-vocabulary";

export class DataPsmSetRootCollection extends CoreOperation {
  static readonly TYPE = PSM.SET_ROOT_COLLECTION;

  entityId: string | null = null;

  dataPsmCollectionTechnicalLabel: string | null;

  dataPsmEnforceCollection: boolean;

  constructor() {
    super();
    this.types.push(DataPsmSetRootCollection.TYPE);
  }

  static is(resource: CoreResource | null): resource is DataPsmSetRootCollection {
    return resource?.types.includes(DataPsmSetRootCollection.TYPE);
  }
}