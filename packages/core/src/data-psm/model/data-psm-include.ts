import {ExtendableCoreResource} from "./extendable-core-resource.ts";
import * as PSM from "../data-psm-vocabulary.ts";

export class DataPsmInclude extends ExtendableCoreResource {
  private static readonly TYPE = PSM.INCLUDE;

  /**
   * May include {@link DataPsmClass}.
   * @todo it should be possible to also include {@link DataPsmClassReference}
   */
  dataPsmIncludes: string | null = null;

  constructor(iri: string | null = null) {
    super(iri);
    this.types.push(DataPsmInclude.TYPE);
  }

  static is(resource: any): resource is DataPsmInclude {
    return resource?.types?.includes(DataPsmInclude.TYPE);
  }
}
