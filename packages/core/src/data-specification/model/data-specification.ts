import { DataSpecificationArtefact } from "./data-specification-artefact";
import {DataSpecificationArtefactBuilderConfiguration} from "./data-specification-artefact-builder-configuration";

export class DataSpecification {
  iri: string | null = null;

  pim: string | null = null;

  psms: string[] = [];

  /**
   * IRIs of other data specifications.
   */
  importsDataSpecifications: string[] = [];

  /**
   * All artefacts that should be generated.
   */
  artefacts: DataSpecificationArtefact[] = [];

  /**
   * Specifies properties for artifacts builders that can extend {@link artefacts} field by adding other artefacts on
   * the fly. This allows user to dynamically add schemas without the need to manually specify the artifacts.
   */
  artefactConfiguration: DataSpecificationArtefactBuilderConfiguration[] = [];
}
