import {DataSpecificationArtefact} from "./data-specification-artefact";

/**
 * Documentation may include other artefacts, such as schemas or examples.
 */
export class DataSpecificationDocumentation extends DataSpecificationArtefact {

  /**
   * List of models that must be included, additional models may be added
   * from included artefacts.
   */
  psms: string[] = [];

  /**
   * List of other artefacts that should be included in the specification.
   */
  artefacts: string[] = [];

}
