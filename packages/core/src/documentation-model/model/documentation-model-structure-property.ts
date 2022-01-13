import {
  DocumentationModelStructureType,
} from "./documentation-model-structure-type";
import {
  DocumentationModelConceptualProperty,
} from "./documentation-model-conceptual-property";

export class DocumentationModelStructureProperty {

  technicalLabel: string | null = null;

  humanLabel: string | null = null;

  humanDescription: string | null = null;

  anchor: string | null = null;

  types: DocumentationModelStructureType[] = [];

  conceptualProperty: DocumentationModelConceptualProperty | null = null;

  cardinalityMin: number | null = null;

  cardinalityMax: number | null = null;

}
