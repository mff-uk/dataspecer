import {DataSpecificationArtefact} from "./data-specification-artefact";

export class DataSpecification {

  iri: string | null = null;

  pim: string | null = null;

  psms: string [] = [];

  /**
   * IRIs of other data specifications.
   */
  importsDataSpecifications: string[] = [];

  /**
   * All artefacts that should be generated.
   */
  artefacts: DataSpecificationArtefact[] = [];

}