import { DataSpecificationArtefact } from "./data-specification-artefact.ts";

/**
 * Documentation may include other artefacts, such as schemas or examples.
 */
export class DataSpecificationDocumentation extends DataSpecificationArtefact {
  /**
   * Artefacts to include from the owner specification.
   */
  artefacts: string[] = [];

  constructor() {
    super();
    this.type = "documentation";
  }

  static is(
    artefact: DataSpecificationArtefact
  ): artefact is DataSpecificationDocumentation {
    return artefact.type === "documentation";
  }
}
