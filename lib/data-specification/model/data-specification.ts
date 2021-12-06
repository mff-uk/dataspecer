import {DataSpecificationArtefact} from "./data-specification-artefact";

export class DataSpecification {

  iri: string | null = null;

  /**
   * User given name, we do not support multiple languages here.
   */
  name: string | null = null;

  pim: string | null = null;

  psms: string [] = [];

  importsDataSpecifications: string[] = [];

  artefacts: DataSpecificationArtefact[] = [];

}