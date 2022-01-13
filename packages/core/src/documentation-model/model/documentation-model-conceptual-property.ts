import {
  DocumentationModelConceptualType,
} from "./documentation-model-conceptual-type";

export class DocumentationModelConceptualProperty {

  humanLabel: string | null;

  humanDescription: string | null;

  anchor: string | null;

  types: DocumentationModelConceptualType[] = [];

  cimIri: string | null;

  pimIri: string | null;

  cardinalityMin: number | null = null;

  cardinalityMax: number | null = null;

}
