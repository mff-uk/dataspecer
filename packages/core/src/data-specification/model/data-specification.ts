import {DataSpecificationArtefact} from "./data-specification-artefact";

export class DataSpecification {

  iri: string | null = null;

  pim: string | null = null;

  psms: string [] = [];

  importsDataSpecifications: string[] = [];

  artefacts: DataSpecificationArtefact[] = [];

}