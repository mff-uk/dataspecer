import {
  WebSpecificationStructureType,
} from "./web-specification-structure-type";
import {
  WebSpecificationConceptualProperty,
} from "./web-specification-conceptual-property";

export class WebSpecificationStructureProperty {

  technicalLabel: string | null = null;

  humanLabel: string | null = null;

  humanDescription: string | null = null;

  anchor: string | null = null;

  types: WebSpecificationStructureType[] = [];

  conceptualProperty: WebSpecificationConceptualProperty | null = null;

}
