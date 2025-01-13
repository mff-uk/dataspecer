import { ConceptualModel } from "../../conceptual-model";
import { propagateCardinality } from "./propagate-cardinality";
import { structureModelAddCodelists } from "./add-codelists";
import { structureModelFlattenInheritance } from "./instantiate-properties";
import { structureModelDematerialize } from "./dematerialize";
import { propagateLabel } from "./propagate-label";
import { DataSpecification } from "../../data-specification/model";
import { addDataSpecification } from "./add-data-specification";
import { propagateCimIri } from "./propagate-cim-iri";
import { StructureModel } from "../model";
import { propagateReverse } from "./propagate-reverse";
import { propagateRegex } from "./propagate-regex";
import { propagateExample } from "./propagate-example";
import { propagateLanguageStringRequiredLanguages } from "./propagate-language-string-required-languages";
import { addSemanticPaths } from "./add-semantic-paths";

type ConceptualTransformation = (
  conceptualModel: ConceptualModel,
  structureModel: StructureModel
) => StructureModel;

type StructureTransformation = (
  structureModel: StructureModel
) => StructureModel;

/**
 * Default transformation pipeline at the conceptual level.
 */
export const defaultConceptualTransformations: ConceptualTransformation[] = [
  structureModelAddCodelists,
  propagateCardinality,
  structureModelAddCodelists,
  propagateLabel,
  propagateCimIri,
  propagateReverse,
  propagateRegex,
  propagateExample,
  propagateLanguageStringRequiredLanguages,
  addSemanticPaths,
];

/**
 * Default transformation pipeline at the structure level.
 */
export const defaultStructureTransformations: StructureTransformation[] = [
  structureModelFlattenInheritance,
  structureModelDematerialize,
];

/**
 * Apply all transformations.
 */
export function transformStructureModel(
  conceptualModel: ConceptualModel,
  structureModel: StructureModel,
  specifications: DataSpecification[] | null = null,
  conceptualTransformations: ConceptualTransformation[] | null = null,
  structureTransformations: StructureTransformation[] | null = null
): StructureModel {
  let result = structureModel;
  // Conceptual level first.
  conceptualTransformations ??= defaultConceptualTransformations;
  for (const conceptualTransformation of conceptualTransformations) {
    result = conceptualTransformation(conceptualModel, result);
  }
  // Next just structure transformations..
  structureTransformations ??= defaultStructureTransformations;
  for (const structureTransformation of structureTransformations) {
    result = structureTransformation(result);
  }
  // Optional.
  if (specifications !== null) {
    result = addDataSpecification(result, specifications);
  }
  return result;
}
