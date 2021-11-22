import {
  WebSpecificationConceptualType,
} from "./web-specification-conceptual-type";

export class WebSpecificationConceptualProperty {

  humanLabel: string | null;

  humanDescription: string | null;

  anchor: string | null;

  types: WebSpecificationConceptualType[] = [];

  cimIri: string | null;

  pimIri: string | null;

}
