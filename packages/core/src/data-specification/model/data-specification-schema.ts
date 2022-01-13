import {DataSpecificationArtefact} from "./data-specification-artefact";

/**
 * Schema represent structure defined by a single structural model, like
 * data-psm.
 */
export class DataSpecificationSchema extends DataSpecificationArtefact {

  psm: string | null = null;

  constructor() {
    super();
    this.type = "schema";
  }

  static is(artefact: DataSpecificationArtefact)
    : artefact is DataSpecificationArtefact {
    return artefact.type === "schema";
  }

}
