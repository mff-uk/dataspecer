import {
  DocumentationModelConceptualProperty,
} from "./documentation-model-conceptual-property";

export class DocumentationModelConceptualEntity {

  humanLabel: string | null;

  humanDescription: string | null;

  anchor: string | null;

  properties: DocumentationModelConceptualProperty[] = [];

  cimIri: string | null;

  pimIri: string | null;

  isCodelist: boolean = false;

  codelistUrls: string[] = [];

}
