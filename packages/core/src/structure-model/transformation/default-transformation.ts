import {ConceptualModel} from "../../conceptual-model";
import {StructureModel} from "../model";
import {propagateCardinality} from "./propagate-cardinality";
import {structureModelAddCodelists} from "./add-codelists";
import {structureModelFlattenInheritance} from "./instantiate-properties";
import {structureModelDematerialize} from "./dematerialize";
import {propagateLabel} from "./propagate-label";

/**
 * Apply all transformations.
 */
export function transformStructureModel(
  conceptualModel: ConceptualModel,
  structureModel: StructureModel
): StructureModel {
  let result = structureModel;
  // Conceptual level first.
  result = structureModelAddCodelists(conceptualModel, result);
  result = propagateCardinality(conceptualModel, result);
  result = structureModelAddCodelists(conceptualModel, result);
  result = propagateLabel(conceptualModel, result);
  // Next just structure transformations..
  result = structureModelFlattenInheritance(result);
  result = structureModelDematerialize(result);
  return result;
}
