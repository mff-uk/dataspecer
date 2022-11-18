import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { LanguageString } from "@dataspecer/core/core";
import {
  ConceptualModel,
  ConceptualModelClass,
  ConceptualModelProperty,
} from "@dataspecer/core/conceptual-model";
import {
  StructureModel,
  StructureModelClass,
  StructureModelProperty,
} from "@dataspecer/core/structure-model/model";
import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationDocumentation,
} from "@dataspecer/core/data-specification/model";

/**
 * Context given to adapters.
 */
export class BikeshedAdapterContext {
  readonly generatorContext: ArtefactGeneratorContext;

  /**
   * In case of missing string a default value is returned.
   */
  selectString: (string: LanguageString | null) => string;

  selectOptionalString: (string: LanguageString | null) => string | null;

  sanitizeLink: (label: string) => string;

  conceptualClassAnchor: (conceptualModel: ConceptualModelClass) => string;

  conceptualPropertyAnchor: (
    conceptualClass: ConceptualModelClass,
    conceptualProperty: ConceptualModelProperty
  ) => string;

  structuralClassAnchor: (
    format: string,
    structureModel: StructureModel,
    structureClass: StructureModelClass
  ) => string;

  structuralPropertyAnchor: (
    format: string,
    structureModel: StructureModel,
    structureClass: StructureModelClass,
    structureProperty: StructureModelProperty
  ) => string;
}

/**
 * Extension of context given to other generators, so they can include
 * the artefact into the documentation.
 */
export class BikeshedAdapterArtefactContext extends BikeshedAdapterContext {
  /**
   * Owner artefact of the documentation.
   */
  readonly ownerArtefact: DataSpecificationDocumentation;

  /**
   * Owner specification for an artefact to include.
   */
  readonly specification: DataSpecification;

  /**
   * Artefact to include by the generator.
   */
  readonly artefact: DataSpecificationArtefact;

  /**
   * Current conceptual model.
   */
  readonly conceptualModel: ConceptualModel;

  /**
   * Non-transformed structural model for given artefact.
   */
  readonly structureModel: StructureModel;
}
