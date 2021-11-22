import {
  WebSpecificationConceptualProperty,
} from "./web-specification-conceptual-property";

export class WebSpecificationConceptualEntity {

  humanLabel: string | null;

  humanDescription: string | null;

  anchor: string | null;

  properties: WebSpecificationConceptualProperty[] = [];

  cimIri: string | null;

  pimIri: string | null;

  isCodelist: boolean = false;

  codelistUrls: string[] = [];

}
